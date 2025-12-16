<?php

return [
    /*
    |--------------------------------------------------------------------------
    | LDAP Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for LDAP authentication. These settings are used when
    | authenticating users with auth_source = 'ldap'.
    |
    */

    'ldap' => [
        // LDAP server hostname or IP address
        'host' => env('LDAP_HOST', 'ldap.example.com'),

        // LDAP server port (default: 389 for LDAP, 636 for LDAPS)
        'port' => env('LDAP_PORT', 389),

        // Use secure LDAP (LDAPS)
        'use_ssl' => env('LDAP_USE_SSL', false),

        // Use TLS (STARTTLS)
        'use_tls' => env('LDAP_USE_TLS', false),

        // Base DN for user searches (e.g., 'dc=example,dc=com')
        // Note: The user's email address is used directly as the distinguished name for binding
        'base_dn' => env('LDAP_BASE_DN', 'dc=example,dc=com'),

        // Timeout in seconds for LDAP operations
        'timeout' => env('LDAP_TIMEOUT', 5),

        // Network timeout in seconds
        'network_timeout' => env('LDAP_NETWORK_TIMEOUT', 5),
    ],
];

