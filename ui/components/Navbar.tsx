'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, AppWindow as AppIcon } from 'lucide-react';

interface NavbarProps {
  isConnected?: boolean;
}

export default function Navbar({ isConnected }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/apps', label: 'My Apps', icon: AppIcon },
  ];

  return (
    <header className="wood-card border-b-2 border-amber-200/60 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-green-400 via-emerald-400 to-green-500 rounded-2xl flex items-center justify-center border-2 border-green-300/50 shadow-lg">
                  <span className="text-white text-2xl">🌱</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Autonomous Farm</h1>
                <p className="text-xs text-amber-700 font-medium">Growing Apps with AI</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all text-sm
                      ${isActive
                        ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-900 border-2 border-green-400/60 shadow-lg shadow-green-900/10'
                        : 'text-amber-700 hover:bg-amber-100/50 hover:text-amber-900'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isConnected !== undefined && (
              <div className={isConnected ? 'badge-glow-green' : 'badge-nature'}>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} ${isConnected ? 'pulse-glow' : 'animate-pulse'}`} />
                  <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
