import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CircleDollarSign, TrendingUp, PieChart, Target, Shield, Smartphone, ArrowRight, CheckCircle, BarChart3, CreditCard } from 'lucide-react';

export default function Landing() {
  const { user, loading } = useUnifiedAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Animate page entrance
    setIsVisible(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-xl blur-sm opacity-70"></div>
              <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 p-1.5 sm:p-2 rounded-xl shadow-lg">
                <CircleDollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                FedhaSmart
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium hidden xs:block">Smart Finance Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            <ThemeToggle />
            <Link to="/auth" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm" className="touch-target">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="touch-target text-xs sm:text-sm px-3 sm:px-4">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`py-12 sm:py-16 md:py-20 px-3 sm:px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
            🚀 Your Personal Finance Companion
          </Badge>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent leading-tight">
            Take Control of Your
            <br />
            <span className="text-foreground">Financial Future</span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
            Track expenses, manage budgets, set financial goals, and monitor your income with our comprehensive financial management platform designed for everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg touch-target">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link to="/phone-auth" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg touch-target">
                <Smartphone className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Sign Up with Phone
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 bg-background/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
              Everything You Need to Manage Your Money
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Powerful tools designed to help you understand, control, and grow your finances
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 touch-target">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Expense Tracking</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Monitor and categorize your spending with detailed analytics and insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 touch-target">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-green-500/20 transition-colors">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Income Management</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Track multiple income sources and understand your earning patterns
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 touch-target">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <PieChart className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Budget Planning</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Create and manage budgets with real-time tracking and alerts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 touch-target">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Financial Goals</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Set savings goals and track your progress with visual indicators
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 touch-target">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Analytics & Reports</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Get detailed insights with charts, trends, and PDF export capabilities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 touch-target">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-red-500/20 transition-colors">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Secure & Private</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Your financial data is encrypted and protected with enterprise-grade security
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
              Why Choose FedhaSmart?
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2">
              Join thousands of users who have transformed their financial lives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="flex items-start space-x-3 sm:space-x-4 touch-target p-3 sm:p-4 rounded-lg hover:bg-accent/5 transition-colors">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">Easy to Use</h4>
                <p className="text-sm sm:text-base text-muted-foreground">Intuitive interface designed for everyone, from beginners to financial experts</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 touch-target p-3 sm:p-4 rounded-lg hover:bg-accent/5 transition-colors">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">Real-time Insights</h4>
                <p className="text-sm sm:text-base text-muted-foreground">Get instant updates and analytics on your financial health</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 touch-target p-3 sm:p-4 rounded-lg hover:bg-accent/5 transition-colors">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">Multi-platform Access</h4>
                <p className="text-sm sm:text-base text-muted-foreground">Access your data anywhere with responsive design and mobile support</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 touch-target p-3 sm:p-4 rounded-lg hover:bg-accent/5 transition-colors">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">Export & Share</h4>
                <p className="text-sm sm:text-base text-muted-foreground">Generate professional PDF reports for personal use or sharing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-2">
            Ready to Transform Your Finances?
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-2">
            Join FedhaSmart today and take the first step towards financial freedom
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg touch-target">
                Create Your Account
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link to="/phone-auth" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg touch-target">
                <Smartphone className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Quick Phone Signup
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 py-6 sm:py-8 px-3 sm:px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur-sm opacity-70"></div>
              <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 p-1 sm:p-1.5 rounded-lg shadow-lg">
                <CircleDollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
            </div>
            <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              FedhaSmart
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            © 2025 FedhaSmart. Your trusted financial companion.
          </p>
        </div>
      </footer>
    </div>
  );
}
