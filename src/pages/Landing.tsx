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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-xl blur-sm opacity-70"></div>
              <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 p-2 rounded-xl shadow-lg">
                <CircleDollarSign className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                FedhaSmart
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Smart Finance Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`py-20 px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            🚀 Your Personal Finance Companion
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            Take Control of Your
            <br />
            <span className="text-foreground">Financial Future</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Track expenses, manage budgets, set financial goals, and monitor your income with our comprehensive financial management platform designed for everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="px-8 py-6 text-lg">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/phone-auth">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Smartphone className="mr-2 h-5 w-5" />
                Sign Up with Phone
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Manage Your Money
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to help you understand, control, and grow your finances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Expense Tracking</CardTitle>
                <CardDescription>
                  Monitor and categorize your spending with detailed analytics and insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Income Management</CardTitle>
                <CardDescription>
                  Track multiple income sources and understand your earning patterns
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <PieChart className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Budget Planning</CardTitle>
                <CardDescription>
                  Create and manage budgets with real-time tracking and alerts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>
                  Set savings goals and track your progress with visual indicators
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Get detailed insights with charts, trends, and PDF export capabilities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your financial data is encrypted and protected with enterprise-grade security
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose FedhaSmart?
            </h3>
            <p className="text-xl text-muted-foreground">
              Join thousands of users who have transformed their financial lives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Easy to Use</h4>
                <p className="text-muted-foreground">Intuitive interface designed for everyone, from beginners to financial experts</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Real-time Insights</h4>
                <p className="text-muted-foreground">Get instant updates and analytics on your financial health</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Multi-platform Access</h4>
                <p className="text-muted-foreground">Access your data anywhere with responsive design and mobile support</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Export & Share</h4>
                <p className="text-muted-foreground">Generate professional PDF reports for personal use or sharing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Finances?
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            Join FedhaSmart today and take the first step towards financial freedom
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="px-8 py-6 text-lg">
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/phone-auth">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Smartphone className="mr-2 h-5 w-5" />
                Quick Phone Signup
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur-sm opacity-70"></div>
              <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 p-1.5 rounded-lg shadow-lg">
                <CircleDollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              FedhaSmart
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 FedhaSmart. Your trusted financial companion.
          </p>
        </div>
      </footer>
    </div>
  );
}
