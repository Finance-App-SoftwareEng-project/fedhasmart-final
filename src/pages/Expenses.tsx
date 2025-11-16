/**
 * Expenses Page Component
 * This component provides a comprehensive expense management interface for users.
 * Features include:
 * - Adding new expenses with categorization
 * - Viewing expense analytics and summaries
 * - Filtering expenses by category and date range
 * - Deleting existing expenses
 * - Real-time expense tracking and calculations
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, TrendingUp, Calendar, DollarSign, PieChart, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { exportFinancialDataToPDF } from '@/lib/pdfExport';
import { ResponsiveTable } from '@/components/ResponsiveTable';

/**
 * Predefined expense categories for consistent data organization
 * These categories help users classify their expenses for better tracking
 */
const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'];

/**
 * Interface for expense form data structure
 */
interface ExpenseFormData {
  amount: string;
  category: string;
  date: string;
  notes: string;
}

/**
 * Interface for expense analytics data
 */
interface ExpenseAnalytics {
  totalExpenses: number;
  monthlyTotal: number;
  totalTransactions: number;
  topCategory: { name: string; amount: number } | null;
  categoryTotals: Record<string, number>;
}

/**
 * Main Expenses component for expense management
 * Handles user authentication, expense CRUD operations, and data visualization
 */
export default function Expenses() {
  // Authentication hooks - support both Supabase and unified auth systems
  const { user: supabaseUser, loading: authLoading } = useAuth();
  const { user: unifiedUser } = useUnifiedAuth();
  const navigate = useNavigate();
  
  /**
   * Prioritize unified user authentication over Supabase user
   * This provides flexibility for different authentication providers
   */
  const user = unifiedUser || supabaseUser;

  // Core state management for expenses data and UI interactions
  const [expenses, setExpenses] = useState<any[]>([]); // Store all user expenses
  const [open, setOpen] = useState(false); // Control add expense dialog visibility
  
  // Filtering state for enhanced user experience
  const [filterCategory, setFilterCategory] = useState('all'); // Category-based filtering
  const [dateRange, setDateRange] = useState('all'); // Time-based filtering
  const [exportingPDF, setExportingPDF] = useState(false); // PDF export loading state
  
  /**
   * Form state for adding new expenses
   * Initialized with current date for better UX
   */
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    notes: '',
  });

  /**
   * Calculate comprehensive expense analytics for dashboard display
   * Provides insights into spending patterns and financial behavior
   * @returns ExpenseAnalytics object with calculated metrics
   */
  const getExpenseAnalytics = (): ExpenseAnalytics => {
    // Calculate total expenses across all time periods
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Get current month and year for monthly calculations
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    /**
     * Filter expenses for current month only
     * Used for monthly spending tracking and budgeting insights
     */
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
    });
    
    // Calculate monthly total for current month tracking
    const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    /**
     * Aggregate expenses by category for spending pattern analysis
     * Helps users understand where their money is going
     */
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
      return acc;
    }, {} as Record<string, number>);
    
    /**
     * Find the category with highest spending
     * Sorts categories by total amount in descending order
     */
    const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    return {
      totalExpenses,
      monthlyTotal,
      totalTransactions: expenses.length, // Total number of expense entries
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] as number } : null,
      categoryTotals
    };
  };

  // Generate analytics data for dashboard display
  const analytics = getExpenseAnalytics();

  /**
   * Authentication effect hook
   * Redirects users to authentication page if not logged in
   * Runs when authentication state changes
   */
  useEffect(() => {
    // Only redirect after auth loading is complete to avoid premature redirects
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  /**
   * Data loading effect hook
   * Triggers expense data loading when user authentication is confirmed
   * Ensures data is only loaded for authenticated users
   */
  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  /**
   * Load all expenses from the database for the current user
   * Fetches expenses ordered by date (most recent first) for better UX
   * Handles error states with user-friendly toast notifications
   */
  const loadExpenses = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false }); // Most recent expenses first

      if (error) {
        console.error('Database error loading expenses:', error);
        toast.error('Failed to load expenses');
      } else {
        // Ensure we always have an array, even if data is null
        setExpenses(data || []);
      }
    } catch (err) {
      console.error('Unexpected error loading expenses:', err);
      toast.error('An unexpected error occurred while loading expenses');
    }
  };

  /**
   * Handle form submission for adding new expenses
   * Validates user authentication, processes form data, and updates the database
   * @param e - React form event to prevent default submission behavior
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault(); // Prevent default form submission

    // Ensure user is authenticated before proceeding
    if (!user) {
      toast.error('You must be logged in to add expenses');
      return;
    }

    try {
      // Insert new expense into database with user association
      const { error } = await supabase.from('expenses').insert({
        user_id: user.id, // Associate expense with current user
        amount: parseFloat(formData.amount), // Convert string to number for calculations
        category: formData.category,
        date: formData.date,
        notes: formData.notes || null, // Handle empty notes gracefully
      });

      if (error) {
        console.error('Database error adding expense:', error);
        toast.error('Failed to add expense');
      } else {
        // Success flow: notify user, reset form, close dialog, refresh data
        toast.success('Expense added successfully');
        
        // Reset form to initial state for next entry
        setFormData({ 
          amount: '', 
          category: '', 
          date: new Date().toISOString().split('T')[0], // Reset to current date
          notes: '' 
        });
        
        setOpen(false); // Close the add expense dialog
        loadExpenses(); // Refresh expenses list to show new entry
      }
    } catch (err) {
      console.error('Unexpected error adding expense:', err);
      toast.error('An unexpected error occurred while adding the expense');
    }
  };

  /**
   * Handle expense deletion with confirmation
   * Removes expense from database and refreshes the expense list
   * @param id - Unique identifier of the expense to delete
   */
  const handleDelete = async (id: string): Promise<void> => {
    try {
      // Delete expense from database by ID
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database error deleting expense:', error);
        toast.error('Failed to delete expense');
      } else {
        // Success: notify user and refresh data
        toast.success('Expense deleted successfully');
        loadExpenses(); // Refresh expenses list to reflect deletion
      }
    } catch (err) {
      console.error('Unexpected error deleting expense:', err);
      toast.error('An unexpected error occurred while deleting the expense');
    }
  };

  /**
   * Advanced date range filtering function
   * Provides flexible time-based filtering for expense analysis
   * @param expense - Individual expense object to filter
   * @returns boolean indicating if expense matches selected date range
   */
  const getDateRangeFilter = (expense: any): boolean => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        // Match expenses from today only
        return expenseDate.toDateString() === now.toDateString();
      case 'week':
        // Match expenses from the last 7 days
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expenseDate >= weekAgo;
      case 'month':
        // Match expenses from current month and year
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
      case 'year':
        // Match expenses from current year
        return expenseDate.getFullYear() === now.getFullYear();
      default:
        // 'all' case - show all expenses regardless of date
        return true;
    }
  };

  /**
   * Apply multiple filters to expenses for enhanced user experience
   * Combines category and date range filtering for precise expense viewing
   * Users can filter by both category and time period simultaneously
   */
  const filteredExpenses = expenses.filter((exp) => {
    // Check if expense matches selected category (or show all categories)
    const categoryMatch = filterCategory === 'all' || exp.category === filterCategory;
    
    // Check if expense matches selected date range
    const dateMatch = getDateRangeFilter(exp);
    
    // Expense must match both filters to be displayed
    return categoryMatch && dateMatch;
  });

  /**
   * Handle PDF export for expenses with current filters applied
   * Exports filtered expense data based on user's selected criteria
   */
  const handleExportExpenses = async (): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to export expenses');
      return;
    }

    setExportingPDF(true);
    try {
      // Convert current date range filter to export format
      let dateRangeFilter;
      if (dateRange !== 'all') {
        const now = new Date();
        const from = new Date();
        
        switch (dateRange) {
          case 'today':
            from.setDate(now.getDate());
            break;
          case 'week':
            from.setDate(now.getDate() - 7);
            break;
          case 'month':
            from.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            from.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        dateRangeFilter = {
          from: from.toISOString().split('T')[0],
          to: now.toISOString().split('T')[0]
        };
      }

      await exportFinancialDataToPDF(user.id, 'expenses', dateRangeFilter);
      toast.success('Expenses exported to PDF successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export expenses');
    } finally {
      setExportingPDF(false);
    }
  };

  // Render loading state while authentication is being determined
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Return null if user is not authenticated (will be redirected by useEffect)
  if (!user) return null;

  /**
   * Main component render
   * Structured layout with navigation, analytics dashboard, and expense management
   */
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation component for consistent app navigation */}
      <Navbar />
      
      {/* Main content area with responsive padding for mobile and desktop */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 mobile-content-padding">
        {/* Page header with title and action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Expenses</h1>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Export expenses button */}
            <Button 
              variant="outline" 
              onClick={handleExportExpenses}
              disabled={exportingPDF || expenses.length === 0}
              className="flex items-center gap-2 touch-target w-full sm:w-auto text-sm sm:text-base"
            >
              <Download className="h-4 w-4" />
              {exportingPDF ? 'Exporting...' : 'Export PDF'}
            </Button>
            
            {/* Add expense dialog trigger */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="touch-target w-full sm:w-auto text-sm sm:text-base">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Add Expense</Button>
              </form>
            </DialogContent>
              </Dialog>
            </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="touch-target">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Expenses</p>
                  <p className="text-xl sm:text-2xl font-bold">KES {analytics.totalExpenses.toLocaleString()}</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="touch-target">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-xl sm:text-2xl font-bold">KES {analytics.monthlyTotal.toLocaleString()}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="touch-target">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Transactions</p>
                  <p className="text-xl sm:text-2xl font-bold">{analytics.totalTransactions}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="touch-target">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Top Category</p>
                  <p className="text-base sm:text-lg font-bold">{analytics.topCategory?.name || 'None'}</p>
                  {analytics.topCategory && (
                    <p className="text-xs sm:text-sm text-muted-foreground">KES {analytics.topCategory.amount.toLocaleString()}</p>
                  )}
                </div>
                <PieChart className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Expenses</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full sm:w-[160px] touch-target">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-[180px] touch-target">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No expenses found. Add your first expense to get started!
              </div>
            ) : (
              <ResponsiveTable
                headers={['Date', 'Category', 'Amount', 'Notes', 'Actions']}
                rows={filteredExpenses.map((expense) => [
                  new Date(expense.date).toLocaleDateString(),
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {expense.category}
                  </span>,
                  <span className="font-medium">KES {parseFloat(expense.amount).toLocaleString()}</span>,
                  <span className="max-w-xs truncate">{expense.notes || '-'}</span>,
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(expense.id)}
                    className="touch-target"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                ])}
                mobileCard={(row, index) => {
                  const expense = filteredExpenses[index];
                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-base">KES {parseFloat(expense.amount).toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {expense.category}
                        </span>
                      </div>
                      {expense.notes && (
                        <div className="text-sm text-muted-foreground">
                          {expense.notes}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        className="w-full touch-target text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  );
                }}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
