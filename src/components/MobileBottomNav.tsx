/**
 * Mobile Bottom Navigation Component
 * 
 * Provides a fixed bottom navigation bar for mobile devices.
 * Only visible on mobile screens (hidden on desktop via Tailwind md:hidden).
 * 
 * Features:
 * - Quick navigation to main app sections
 * - Active route highlighting
 * - Responsive design (hidden on desktop)
 * - Conditional rendering (hidden on auth/landing pages)
 */

import { Link, useLocation } from 'react-router-dom';
import { Home, DollarSign, TrendingUp, Wallet, Target, User } from 'lucide-react';

export const MobileBottomNav = () => {
  const location = useLocation();

  // Hide bottom navigation on authentication and landing pages
  // These pages don't need navigation as users aren't logged in yet
  const hideOnPages = ['/auth', '/phone-auth', '/'];
  if (hideOnPages.includes(location.pathname)) {
    return null;
  }

  /**
   * Navigation items configuration
   * Defines the main app sections accessible from the bottom nav
   */
  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/income', label: 'Income', icon: DollarSign },
    { path: '/expenses', label: 'Expenses', icon: TrendingUp },
    { path: '/budgets', label: 'Budgets', icon: Wallet },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-bottom">
      <div className="grid grid-cols-6 gap-1 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
