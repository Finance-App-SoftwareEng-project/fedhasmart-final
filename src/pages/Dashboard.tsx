import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CreditCard, TrendingUp, Activity, ArrowUpCircle, PiggyBank, Calculator } from 'lucide-react';

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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadDashboardData();
    }
  }, [user]);

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
        .gte('date', currentMonth.toISOString().split('T')[0]);

      const totalIncome = income?.reduce((sum, inc) => sum + Number(inc.amount), 0) || 0;

      // Get budgets (both monthly and weekly for current period)
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);

      const { data: budgets } = await supabase
        .from('budgets')
        .select('limit_amount, spent_amount, period, month, category');

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {displayName ? `${displayName}'s Dashboard` : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your financial overview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Income
              </CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {stats.totalIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Balance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                KES {stats.netBalance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {stats.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Remaining Budget
              </CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.remainingBudget >= 0 ? 'text-success' : 'text-destructive'}`}>
                KES {stats.remainingBudget.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Savings Progress
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {stats.savingsProgress.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                KES {stats.totalContributions.toLocaleString()} contributed this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Financial Health
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${healthStatus.color}`}>
                {healthStatus.label}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.savingsRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
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
                      label={(entry) => entry.name}
                      outerRadius={80}
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
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No expense data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyExpenses.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyExpenses}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `KES ${value.toLocaleString()}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Spending"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No historical data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
