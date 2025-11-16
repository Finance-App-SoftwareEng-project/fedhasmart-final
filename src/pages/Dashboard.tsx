/**
 * Dashboard Component
 * 
 * Main dashboard page displaying comprehensive financial overview including:
 * - Financial statistics (income, expenses, net balance, savings)
 * - Expense category breakdown (pie chart)
 * - Spending trends over time (line chart with daily/weekly/monthly views)
 * - Budget tracking and remaining budget calculations
 * - Financial health indicators
 * - PDF export functionality
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CreditCard, TrendingUp, Activity, ArrowUpCircle, PiggyBank, Calculator, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { exportFinancialDataToPDF } from '@/lib/pdfExport';

export default function Dashboard() {
  // Authentication hooks - support both auth systems for flexibility
  const { user: supabaseUser, loading: authLoading } = useAuth();
  const { user: unifiedUser } = useUnifiedAuth();
  const navigate = useNavigate();
  
  // Prioritize unified user, fall back to Supabase user if needed
  // This allows the component to work with either authentication system
  const user = unifiedUser || supabaseUser;
  // Dashboard state management
  const [stats, setStats] = useState({
    totalIncome: 0, // Total income for current month
    totalExpenses: 0, // Total expenses for current month
    remainingBudget: 0, // Remaining budget after expenses
    savingsProgress: 0, // Total saved across all goals
    totalContributions: 0, // Contributions made this month
    goalCount: 0, // Number of active savings goals
    netBalance: 0, // Income - Expenses - Contributions
    savingsRate: 0, // Percentage of income saved
  });
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]); // Category breakdown for pie chart
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]); // Historical spending data for line chart
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly'); // Chart time period
  const [displayName, setDisplayName] = useState<string>(''); // User's display name for greeting
  const [exportingPDF, setExportingPDF] = useState(false); // PDF export loading state

  // Redirect to auth if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load user profile and dashboard data when user is authenticated
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadDashboardData();
    }
  }, [user]);

  // Reload time series data when time period changes
  useEffect(() => {
    if (user) {
      // Extract user ID - handles both unified and Supabase user formats
      const userId = 'supabaseUser' in user && user.supabaseUser?.id 
        ? user.supabaseUser.id 
        : 'id' in user 
        ? user.id 
        : null;
      
      if (userId) {
        loadTimeSeriesData(timePeriod, userId);
      }
    }
  }, [timePeriod, user]);

  const loadUserProfile = async () => {
    // Try to get display name from unified user first
    if ('displayName' in user && user.displayName) {
      setDisplayName(user.displayName);
      return;
    }

    // Otherwise fetch from profiles table
    const userId = 'supabaseUser' in user && user.supabaseUser?.id 
      ? user.supabaseUser.id 
      : 'id' in user 
      ? user.id 
      : null;

    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setDisplayName(data.display_name || '');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  /**
   * Load time series data for spending trends chart
   * 
   * Fetches historical expense data and groups it by the selected time period.
   * Supports daily, weekly, and monthly views with appropriate date ranges.
   * 
   * @param period - Time period for grouping (daily, weekly, monthly)
   * @param userId - User ID to fetch data for
   */
  const loadTimeSeriesData = async (period: 'daily' | 'weekly' | 'monthly', userId: string) => {
    try {
      let startDate: Date;
      let groupBy: string;
      let limit: number;

      // Configure date range and data grouping based on selected period
      // Each period shows a different amount of historical data
      switch (period) {
        case 'daily':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30); // Last 30 days for daily view
          groupBy = 'day';
          limit = 30;
          break;
        case 'weekly':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - (12 * 7)); // Last 12 weeks for weekly view
          groupBy = 'week';
          limit = 12;
          break;
        case 'monthly':
        default:
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 6); // Last 6 months for monthly view
          groupBy = 'month';
          limit = 6;
          break;
      }

      const { data: historicalExpenses } = await supabase
        .from('expenses')
        .select('amount, date')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      // Group data based on selected period
      const dataMap = new Map();
      
      historicalExpenses?.forEach((exp) => {
        let key: string;
        let formattedLabel: string;
        const expDate = new Date(exp.date);

        switch (period) {
          case 'daily':
            key = exp.date; // YYYY-MM-DD
            formattedLabel = expDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            break;
          case 'weekly':
            // Get week start (Monday)
            const weekStart = new Date(expDate);
            const dayOfWeek = weekStart.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            weekStart.setDate(weekStart.getDate() - daysToMonday);
            key = weekStart.toISOString().split('T')[0];
            formattedLabel = weekStart.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            break;
          case 'monthly':
          default:
            key = exp.date.substring(0, 7); // YYYY-MM
            const monthDate = new Date(key + '-01');
            formattedLabel = monthDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short' 
            });
            break;
        }

        const current = dataMap.get(key) || 0;
        dataMap.set(key, current + Number(exp.amount));
      });

      // Convert to array and sort
      const timeSeriesArray = Array.from(dataMap.entries()).map(([key, amount]) => {
        let formattedLabel: string;
        
        switch (period) {
          case 'daily':
            const dayDate = new Date(key);
            formattedLabel = dayDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            break;
          case 'weekly':
            const weekDate = new Date(key);
            formattedLabel = `Week of ${weekDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}`;
            break;
          case 'monthly':
          default:
            const monthDate = new Date(key + '-01');
            formattedLabel = monthDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short' 
            });
            break;
        }

        return {
          period: formattedLabel,
          rawPeriod: key,
          amount,
        };
      }).sort((a, b) => a.rawPeriod.localeCompare(b.rawPeriod));

      setTimeSeriesData(timeSeriesArray);
    } catch (error) {
      console.error('Error loading time series data:', error);
    }
  };

  /**
   * Load all dashboard data
   * 
   * Fetches and calculates comprehensive financial statistics including:
   * - Monthly income and expenses
   * - Budget tracking and remaining budget
   * - Savings goals progress
   * - Financial health metrics (net balance, savings rate)
   * - Expense category breakdown
   */
  const loadDashboardData = async () => {
    // Extract user ID - handles both unified and Supabase user formats
    const userId = 'supabaseUser' in user && user.supabaseUser?.id 
      ? user.supabaseUser.id 
      : 'id' in user 
      ? user.id 
      : null;
      
    if (!userId) return;

    try {
      // Calculate start of current month for filtering
      const currentMonth = new Date();
      currentMonth.setDate(1); // Set to first day of month
      
      // Fetch expenses for current month
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, category, date')
        .eq('user_id', userId)
        .gte('date', currentMonth.toISOString().split('T')[0]); // From start of month

      // Calculate total expenses for current month
      const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

      // Fetch income for current month
      const { data: income } = await supabase
        .from('income')
        .select('amount')
        .gte('date', currentMonth.toISOString().split('T')[0]); // From start of month

      // Calculate total income for current month
      const totalIncome = income?.reduce((sum, inc) => sum + Number(inc.amount), 0) || 0;

      // Calculate current week start (Monday) for weekly budget filtering
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);

      // Fetch all budgets
      const { data: budgets } = await supabase
        .from('budgets')
        .select('limit_amount, spent_amount, period, month, category');

      // Filter budgets to only show active ones (current month or current week)
      const currentMonthStr = currentMonth.toISOString().substring(0, 7); // e.g., "2025-10"
      
      const activeBudgets = budgets?.filter(b => {
        if (b.period === 'weekly') {
          // For weekly budgets, check if budget's start date falls within current week
          const budgetDate = new Date(b.month);
          const weekEnd = new Date(currentWeekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);
          return budgetDate >= currentWeekStart && budgetDate < weekEnd;
        } else {
          // For monthly budgets, compare year-month strings (e.g., "2025-10")
          const budgetMonthStr = b.month.substring(0, 7);
          return budgetMonthStr === currentMonthStr;
        }
      }) || [];

      // Calculate total budget limit across all active budgets
      const totalBudget = activeBudgets.reduce((sum, b) => sum + Number(b.limit_amount), 0);
      
      // Calculate how much was spent on budgeted categories
      // Only count expenses in categories that have active budgets
      const budgetedCategories = activeBudgets.map(b => b.category);
      const budgetedExpenses = expenses?.filter(exp => 
        budgetedCategories.includes(exp.category)
      ) || [];
      const spentOnBudgetedCategories = budgetedExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      
      // Calculate remaining budget (total budget - spent on budgeted categories)
      const remainingBudget = totalBudget - spentOnBudgetedCategories;

      // Get goals
      const { data: goals } = await supabase.from('goals').select('*');
      const savingsProgress = goals?.reduce((sum, g) => sum + Number(g.saved_amount), 0) || 0;

      // Get contributions for current month
      const { data: contributions } = await supabase
        .from('contributions')
        .select('amount, date')
        .gte('date', currentMonth.toISOString().split('T')[0]);

      const totalContributions = contributions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

      // Calculate financial health (income - expenses - contributions)
      const netBalance = totalIncome - totalExpenses - totalContributions;
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses - totalContributions) / totalIncome) * 100 : 0;

      setStats({
        totalIncome,
        totalExpenses,
        remainingBudget,
        savingsProgress,
        totalContributions,
        goalCount: goals?.length || 0,
        netBalance,
        savingsRate,
      });

      // Group expenses by category
      const categoryMap = new Map();
      expenses?.forEach((exp) => {
        const current = categoryMap.get(exp.category) || 0;
        categoryMap.set(exp.category, current + Number(exp.amount));
      });

      const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
      }));
      setExpensesByCategory(categoryData);

      // Load time series data based on selected period
      await loadTimeSeriesData(timePeriod, userId);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleExportCompleteDashboard = async () => {
    if (!user) {
      toast.error('You must be logged in to export financial data');
      return;
    }

    setExportingPDF(true);
    try {
      await exportFinancialDataToPDF(user.id, 'all');
      toast.success('Complete financial report exported to PDF successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export financial data');
    } finally {
      setExportingPDF(false);
    }
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  /**
   * Calculate financial health status based on savings rate
   * 
   * Categorizes financial health into four levels:
   * - Excellent: 80%+ savings rate
   * - Good: 60-79% savings rate
   * - Fair: 40-59% savings rate
   * - Poor: <40% savings rate
   * 
   * @returns Object with health label and color class
   */
  const getHealthStatus = () => {
    if (stats.savingsRate >= 80) return { label: "Excellent", color: "text-success" };
    if (stats.savingsRate >= 60) return { label: "Good", color: "text-primary" };
    if (stats.savingsRate >= 40) return { label: "Fair", color: "text-warning" };
    return { label: "Poor", color: "text-destructive" };
  };

  const healthStatus = getHealthStatus();

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background mobile-content-padding">
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {displayName ? `${displayName}'s Dashboard` : 'Dashboard'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Welcome back{displayName ? `, ${displayName}` : ''}! Here's your financial overview.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleExportCompleteDashboard}
            disabled={exportingPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {exportingPDF ? 'Generating Report...' : 'Export Complete Report'}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="touch-target">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Income
              </CardTitle>
              <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">KES {stats.totalIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="touch-target">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Net Balance
              </CardTitle>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${stats.netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                KES {stats.netBalance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="touch-target">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">KES {stats.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="touch-target">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Remaining Budget
              </CardTitle>
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${stats.remainingBudget >= 0 ? 'text-success' : 'text-destructive'}`}>
                KES {stats.remainingBudget.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="touch-target">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Savings Progress
              </CardTitle>
              <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">KES {stats.savingsProgress.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                KES {stats.totalContributions.toLocaleString()} contributed this month
              </p>
            </CardContent>
          </Card>

          <Card className="touch-target">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Financial Health
              </CardTitle>
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${healthStatus.color}`}>
                {healthStatus.label}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.savingsRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mt-4 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Expenses by Category This Month</CardTitle>
            </CardHeader>
            <CardContent>
              {expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `KES ${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                  No expense data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base sm:text-lg">Spending Trend</CardTitle>
                <div className="flex gap-1">
                  <Badge 
                    variant={timePeriod === 'daily' ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1 text-xs"
                    onClick={() => setTimePeriod('daily')}
                  >
                    Daily
                  </Badge>
                  <Badge 
                    variant={timePeriod === 'weekly' ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1 text-xs"
                    onClick={() => setTimePeriod('weekly')}
                  >
                    Weekly
                  </Badge>
                  <Badge 
                    variant={timePeriod === 'monthly' ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1 text-xs"
                    onClick={() => setTimePeriod('monthly')}
                  >
                    Monthly
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart 
                    data={timeSeriesData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      interval={timePeriod === 'daily' ? 'preserveStartEnd' : 0}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Spending']}
                      labelFormatter={(label) => `${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}: ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      name="Spending"
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                  No historical data available for {timePeriod} view
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
