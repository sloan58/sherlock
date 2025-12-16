<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $email = $this->string('email')->value();
        $password = $this->string('password')->value();

        // Find the user first to determine their auth source
        $user = User::where('email', $email)->first();

        if (! $user) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        // Handle LDAP authentication
        if ($user->auth_source === 'ldap') {
            if (! $this->attemptLdapBind($user, $password)) {
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'email' => __('auth.failed'),
                ]);
            }

            // LDAP bind successful, log the user in
            Auth::login($user, $this->boolean('remember'));
            RateLimiter::clear($this->throttleKey());

            return;
        }

        // Handle local authentication
        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Attempt to authenticate using LDAP bind.
     *
     * @param  User  $user
     * @param  string  $password
     * @return bool
     */
    protected function attemptLdapBind(User $user, string $password): bool
    {
        $config = config('sherlock.ldap');

        // Check if LDAP extension is available
        if (! extension_loaded('ldap')) {
            \Log::error('LDAP extension is not loaded');
            return false;
        }

        // Build LDAP connection string
        $protocol = $config['use_ssl'] ? 'ldaps://' : 'ldap://';
        $host = $config['host'];
        $port = $config['port'];
        $ldapUrl = $protocol . $host . ':' . $port;

        // Connect to LDAP server
        $ldapConn = @ldap_connect($ldapUrl);

        if (! $ldapConn) {
            \Log::error('Failed to connect to LDAP server', ['url' => $ldapUrl]);
            return false;
        }

        // Set LDAP options
        ldap_set_option($ldapConn, LDAP_OPT_PROTOCOL_VERSION, 3);
        ldap_set_option($ldapConn, LDAP_OPT_REFERRALS, 0);
        ldap_set_option($ldapConn, LDAP_OPT_NETWORK_TIMEOUT, $config['network_timeout'] ?? 5);

        // Enable TLS if configured
        if ($config['use_tls'] && ! $config['use_ssl']) {
            if (! @ldap_start_tls($ldapConn)) {
                \Log::error('Failed to start TLS', ['error' => ldap_error($ldapConn)]);
                ldap_close($ldapConn);
                return false;
            }
        }

        // Attempt to bind with user credentials (email is the distinguished name)
        $bindResult = @ldap_bind($ldapConn, $user->email, $password);

        if (! $bindResult) {
            \Log::warning('LDAP bind failed', [
                'user' => $user->email,
                'error' => ldap_error($ldapConn),
            ]);
            ldap_close($ldapConn);
            return false;
        }

        // Bind successful
        ldap_close($ldapConn);
        return true;
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
