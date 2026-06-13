'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Timer, BookOpen, BarChart3 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const tabs = [
  { href: '/', label: 'Focus', Icon: Timer },
  { href: '/academics', label: 'Academics', Icon: BookOpen },
  { href: '/data-center', label: 'Data Center', Icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-12 items-center justify-between">
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Studer
          </span>

          {/* Tab links — desktop only; replaced by MobileNav on mobile */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {tabs.map(({ href, label, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors
                    ${active
                      ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                      : 'text-neutral-500 hover:bg-neutral-100/60 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
                    }
                  `}
                >
                  <Icon size={14} strokeWidth={2} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
