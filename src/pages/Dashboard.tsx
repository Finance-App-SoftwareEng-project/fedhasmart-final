import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { MobileNavigation } from '@/components/MobileNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CreditCard, TrendingUp, Activity, ArrowUpCircle, PiggyBank, Calculator, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportFinancialDataToPDF } from '@/lib/pdfExport';

export default function Dashboard() {
  const { user: supabaseUser, loading: authLoading } = useAuth();
  const { user: unifiedUser } = useUnifiedAuth();
  const navigate = useNavigate();
  
  // Use unified user if available, otherwise fall back to Supabase user
  const user = unifiedUser || supabaseUser;
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    remainingBudget: 0,
    savingsProgress: 0,
    totalContributions: 0,
    goalCount: 0,
    netBalance: 0,
    savingsRate: 0,
  });
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);
  const [displayName, setDisplayName] = useState<string>('');
  const [exportingPDF, setExportingPDF] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [periodData, setPeriodData] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadDashboardData();
      loadPeriodData(chartPeriod);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPeriodData(chartPeriod);
    }
  }, [chartPeriod, user]);

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

  const loadPeriodData = async (period: 'daily' | 'weekly' | 'monthly') => {
    const userId = 'supabaseUser' in user && user.supabaseUser?.id 
      ? user.supabaseUser.id 
      : 'id' in user 
      ? user.id 
      : null;
      
    if (!userId) return;

    try {
      let dateRange;
      let groupBy;
      
      const now = new Date();
      
      switch (period) {
        case 'daily':
          // Last 30 days
          dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          groupBy = (date: string) => date; // Group by full date
          break;
        case 'weekly':
          // Last 12 weeks
          dateRange = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
          groupBy = (date: string) => {
            const d = new Date(date);
            const week = Math.floor((d.getTime() - dateRange.getTime()) / (7 * 24 * 60 * 60 * 1000));
            return `Week ${week + 1}`;
          };
          break;
        case 'monthly':
        default:
          // Last 12 months
          dateRange = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
          groupBy = (date: string) => date.substring(0, 7); // Group by year-month
          break;
      }

      // Fetch expenses and income for the period
      const [expensesRes, incomeRes] = await Promise.all([
        supabase
          .from('expenses')
          .select('amount, date, category')
          .eq('user_id', userId)
          .gte('date', dateRange.toISOString().split('T')[0])
          .order('date', { ascending: true }),
        supabase
          .from('income')
          .select('amount, date')
          .eq('user_id', userId)
          .gte('date', dateRange.toISOString().split('T')[0])
          .order('date', { ascending: true })
      ]);

      // Process data based on period
      const dataMap = new Map();
      
      // Process expenses
      expensesRes.data?.forEach((expense) => {
        const key = groupBy(expense.date);
        const current = dataMap.get(key) || { period: key, expenses: 0, income: 0 };
        current.expenses += Number(expense.amount);
        dataMap.set(key, current);
      });

      // Process income
      incomeRes.data?.forEach((income) => {
        const key = groupBy(income.date);
        const current = dataMap.get(key) || { period: key, expenses: 0, income: 0 };
        current.income += Number(income.amount);
        dataMap.set(key, current);
      });

      // Convert to array and calculate net
      const periodDataArray = Array.from(dataMap.values()).map(item => ({
        ...item,
        net: item.income - item.expenses
      }));

      setPeriodData(periodDataArray);
    } catch (error) {
      console.error('Error loading period data:', error);
    }
  };

  const loadDashboardData = async () => {
    // Use the appropriate user ID based on account type
    const userId = 'supabaseUser' in user && user.supabaseUser?.id 
      ? user.supabaseUser.id 
      : 'id' in user 
      ? user.id 
      : null;
      
    if (!userId) return;

    try {
      // Get total expenses for current month
      const currentMonth = new Date();
      currentMonth.setDate(1);
      
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, category, date')
        .eq('user_id', userId)
        .gte('date', currentMonth.toISOString().split('T')[0]);

      const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

      // Get total income for current month
      const { data: income } = await supabase
        .from('income')
        .select('amount')
        .eq('user_id', userId)
        .gte('date', currentMonth.toISOString().split('T')[0]);

      const totalIncome = income?.reduce((sum, inc) => sum + Number(inc.amount), 0) || 0;

      // Get budgets (both monthly and weekly for current period)
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);

      const { data: budgets } = await supabase
        .from('budgets')
        .select('limit_amount, spent_amount, period, month, category')
        .eq('user_id', userId);

      // Filter budgets for current month or current week
      const currentMonthStr = currentMonth.toISOString().substring(0, 7); // e.g., "2025-10"
      
      const activeBudgets = budgets?.filter(b => {
        if (b.period === 'weekly') {
          // For weekly budgets, check if the budget's start date is within the current week
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

      const totalBudget = activeBudgets.reduce((sum, b) => sum + Number(b.limit_amount), 0);
      
      // Calculate expenses that fall within budgeted categories for the current period
      const budgetedCategories = activeBudgets.map(b => b.category);
      const budgetedExpenses = expenses?.filter(exp => 
        budgetedCategories.includes(exp.category)
      ) || [];
      const spentOnBudgetedCategories = budgetedExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      
      const remainingBudget = totalBudget - spentOnBudgetedCategories;

      // Get goals
      const { data: goals } = await supabase.from('goals').select('*').eq('user_id', userId);
      const savingsProgress = goals?.reduce((sum, g) => sum + Number(g.saved_amount), 0) || 0;

      // Set contributions to 0 for now (feature can be added later)
      const totalContributions = 0;

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

      // Get last 6 months expenses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: historicalExpenses } = await supabase
        .from('expenses')
        .select('amount, date')
        .gte('date', sixMonthsAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const monthlyMap = new Map();
      historicalExpenses?.forEach((exp) => {
        const month = exp.date.substring(0, 7);
        const current = monthlyMap.get(month) || 0;
        monthlyMap.set(month, current + Number(exp.amount));
      });

      const monthlyData = Array.from(monthlyMap.entries()).map(([month, amount]) => ({
        month,
        amount,
      }));
      setMonthlyExpenses(monthlyData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleExportCompleteDashboard = async () => {
    if (!user) {
      toast.error('You must be logged in to export financial data');
      return;
    }

    // Get the correct user ID
    const userId = 'supabaseUser' in user && user.supabaseUser?.id 
      ? user.supabaseUser.id 
      : 'id' in user 
      ? user.id 
      : null;

    if (!userId) {
      toast.error('Unable to identify user for export');
      return;
    }

    setExportingPDF(true);
    try {
      await exportFinancialDataToPDF(userId, 'all');
      toast.success('Complete financial report exported to PDF successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export financial data');
    } finally {
      setExportingPDF(false);
    }
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

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
      <MobileNavigation currentPage="Dashboard" />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {displayName ? `${displayName}'s Dashboard` : 'Dashboard'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Welcome back! Here's your financial overview.
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

        {/* Interactive Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mt-4 sm:mt-6">
          {/* Expenses by Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${((entry.value / expensesByCategory.reduce((sum, e) => sum + e.value, 0)) * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Amount']} 
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                  No expense data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interactive Period Chart */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <CardTitle className="text-base sm:text-lg">Financial Trends</CardTitle>
              
              {/* Period Selector */}
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={chartPeriod === 'daily' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartPeriod('daily')}
                  className="text-xs px-3 py-1"
                >
                  Daily
                </Button>
                <Button
                  variant={chartPeriod === 'weekly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartPeriod('weekly')}
                  className="text-xs px-3 py-1"
                >
                  Weekly
                </Button>
                <Button
                  variant={chartPeriod === 'monthly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartPeriod('monthly')}
                  className="text-xs px-3 py-1"
                >
                  Monthly
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {periodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={periodData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `KES ${value.toLocaleString()}`,
                        name === 'expenses' ? 'Expenses' : name === 'income' ? 'Income' : 'Net Income'
                      ]}
                      labelFormatter={(label) => `Period: ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    
                    {/* Expenses Line */}
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Expenses"
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                    />
                    
                    {/* Income Line */}
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="Income"
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                    />
                    
                    {/* Net Income Line */}
                    <Line
                      type="monotone"
                      dataKey="net"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      name="Net Income"
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground text-sm">
                  <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
                  <p>No {chartPeriod} data available</p>
                  <p className="text-xs mt-1">Add some transactions to see trends</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
