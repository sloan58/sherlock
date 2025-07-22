import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { route } from 'ziggy-js';

export default function AuthLayout({ title }: { title?: string }) {
  return (
    <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
      <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
        <AppLogoIcon className="size-9 fill-current text-[var(--foreground)] dark:text-white" />
      </div>
      <span className="sr-only">{title}</span>
    </Link>
  );
}
