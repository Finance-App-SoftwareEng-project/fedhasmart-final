import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Wallet, LogOut, Settings, User, TrendingUp, CircleDollarSign } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Navbar = () => {
  const { user: supabaseUser } = useAuth();
  const { user: unifiedUser, signOut: unifiedSignOut } = useUnifiedAuth();
  const location = useLocation();

  // Use unified user if available, otherwise fall back to Supabase user
  const user = unifiedUser || supabaseUser;
  const signOut = unifiedUser ? unifiedSignOut : useAuth().signOut;

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/income', label: 'Income' },
    { path: '/expenses', label: 'Expenses' },
    { path: '/budgets', label: 'Budgets' },
    { path: '/goals', label: 'Goals' },
  ];

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur-sm group-hover:blur-md transition-all duration-300 opacity-70"></div>
              <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 p-2 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300">
                <CircleDollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent hidden sm:block tracking-tight">
                FedhaSmart
              </span>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent sm:hidden">
                FS
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider hidden sm:block">
                SMART FINANCE TRACKING
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                asChild
                size="sm"
              >
                <Link to={item.path}>{item.label}</Link>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <Button variant="ghost" asChild size="icon" title="Profile">
              <Link to="/profile">
                <User className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" asChild size="icon" title="Settings">
              <Link to="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" onClick={signOut} size="icon" title="Sign Out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden flex gap-1 pb-3 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? 'default' : 'ghost'}
              size="sm"
              asChild
              className="whitespace-nowrap flex-shrink-0"
            >
              <Link to={item.path}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};
