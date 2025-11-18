import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';
import { 
  ChartBar, 
  PiggyBank, 
  Target, 
  TrendingUp,
  Shield,
  FileText,
  Smartphone,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X,
  Home,
  User,
  Settings,
  LogOut
} from 'lucide-react';

const Landing = () => {
  const { user } = useUnifiedAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-Friendly Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {user ? (
                <Link to="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/auth">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link to="/auth">
                    <Button>Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden flex justify-between items-center">
            <Logo size="sm" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-3">
                {user ? (
                  <>
                    <Link 
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                    >
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link 
                      to="/expenses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                    >
                      <ChartBar className="h-5 w-5 text-primary" />
                      <span className="font-medium">Expenses</span>
                    </Link>
                    <Link 
                      to="/income"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                    >
                      <PiggyBank className="h-5 w-5 text-primary" />
                      <span className="font-medium">Income</span>
                    </Link>
                    <Link 
                      to="/budgets"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Target className="h-5 w-5 text-primary" />
                      <span className="font-medium">Budgets</span>
                    </Link>
                    <Link 
                      to="/goals"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Star className="h-5 w-5 text-primary" />
                      <span className="font-medium">Goals</span>
                    </Link>
                    <Link 
                      to="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Settings className="h-5 w-5 text-primary" />
                      <span className="font-medium">Settings</span>
                    </Link>
                    <div className="border-t pt-3 mt-3">
                      <Link 
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                      >
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Profile</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                    >
                      <User className="h-5 w-5 text-primary" />
                      <span className="font-medium">Login</span>
                    </Link>
                    <Link 
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                    >
                      <ArrowRight className="h-5 w-5" />
                      <span className="font-medium">Get Started</span>
                    </Link>
                    <Link 
                      to="/phone-auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Smartphone className="h-5 w-5 text-primary" />
                      <span className="font-medium">Phone Signup</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {user ? (
          /* Welcome Back Section for Authenticated Users */
          <div className="py-20 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Welcome back, {user.displayName || user.email?.split('@')[0] || 'there'}!
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Ready to manage your finances? Access your dashboard to continue tracking your progress.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/expenses">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <ChartBar className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Landing Page for New Users */
          <>
            {/* Hero Section */}
            <div className="py-20 text-center">
              <Badge variant="secondary" className="mb-6">
                Kuwa Smart Na FedhaSmart
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Take Control of Your{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Financial Future
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                FedhaSmart is the most intuitive personal finance platform designed for modern life. 
                Track expenses, manage budgets, achieve goals, and generate professional reports - all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">
                    Start Free Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/phone-auth">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">
                    <Smartphone className="mr-2 h-5 w-5" />
                    Quick Phone Signup
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No Credit Card Required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Free Forever Plan
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Advanced-Level Security
                </div>
              </div>
            </div>

            {/* Key Features Section */}
            <div className="py-20">
              <div className="text-center mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                  Everything You Need for Financial Success
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Powerful features designed to simplify your financial management and help you make smarter money decisions.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                      <ChartBar className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Smart Expense Tracking</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Automatically categorize and track your expenses with AI-powered insights and real-time analytics.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                      <PiggyBank className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Intelligent Budgeting</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Create adaptive budgets that learn from your spending patterns and help you save more effectively.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                      <Target className="h-8 w-8 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Goal Achievement</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Set and track financial goals with milestone tracking and personalized recommendations.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                      <Smartphone className="h-8 w-8 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Mobile-First Design</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Native mobile experience with offline capabilities, push notifications, and PWA support.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                      <Shield className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Advanced-Level Security</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Encrypted data storage, and secure cloud synchronization.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-8 w-8 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Professional Reports</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Generate detailed PDF reports for tax preparation, loan applications, and financial planning.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Why Choose FedhaSmart Section */}
            <div className="py-20 bg-muted/30 rounded-3xl">
              <div className="text-center mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                  Why Choose FedhaSmart?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of users who trust FedhaSmart for their financial management needs.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Easy to Use</h3>
                      <p className="text-muted-foreground">
                        Intuitive interface designed for users of all technical levels. Start managing your finances in minutes, not hours.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Trusted by Thousands</h3>
                      <p className="text-muted-foreground">
                        Over 10,000+ active users trust FedhaSmart to manage their finances and achieve their goals.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Highly Rated</h3>
                      <p className="text-muted-foreground">
                        Satisfied users who love our comprehensive features and exceptional support.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
                      <p className="text-muted-foreground">
                        Your financial data is protected with bank-level encryption and never shared with third parties.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Works Everywhere</h3>
                      <p className="text-muted-foreground">
                        Access your finances on any device - desktop, mobile, or tablet. Sync across all platforms seamlessly.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Results-Driven</h3>
                      <p className="text-muted-foreground">
                        Users save an average of 23% more money and achieve their financial goals 40% faster with FedhaSmart.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action Section */}
            <div className="py-20 text-center">
              <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
                  Ready to Transform Your Financial Life?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of users who are already taking control of their finances with FedhaSmart's intelligent money management platform.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 py-4 text-lg">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 text-sm opacity-75">
                  No credit card required • Free forever plan available • Cancel anytime
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 FedHaSmart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;