import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { 
  Menu, 
  X, 
  TrendingUp, 
  ChartBar, 
  PiggyBank, 
  Target, 
  Star, 
  Settings, 
  User,
  Home,
  Calculator
} from 'lucide-react';

interface MobileNavigationProps {
  currentPage: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: TrendingUp },
    { path: '/expenses', label: 'Expenses', icon: ChartBar },
    { path: '/income', label: 'Income', icon: PiggyBank },
    { path: '/budgets', label: 'Budgets', icon: Calculator },
    { path: '/goals', label: 'Goals', icon: Star },
  ];

  const secondaryItems = [
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const getPageIcon = (pageName: string) => {
    const item = [...navigationItems, ...secondaryItems].find(
      item => item.path.includes(pageName.toLowerCase()) || item.label.toLowerCase() === pageName.toLowerCase()
    );
    return item ? item.icon : Home;
  };

  const PageIcon = getPageIcon(currentPage);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <Navbar />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PageIcon className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">{currentPage}</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link 
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="border-t pt-2 mt-2">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link 
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default MobileNavigation;