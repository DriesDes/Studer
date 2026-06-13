'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Timer, BookOpen, BarChart3 } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Focus', Icon: Timer },
  { href: '/academics', label: 'Academics', Icon: BookOpen },
  { href: '/data-center', label: 'Data', Icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-neutral-200 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors min-h-[56px] ${
                active
                  ? 'text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-400 dark:text-neutral-500'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
