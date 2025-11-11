// React hooks for state management and side effects
import { useEffect, useState } from 'react';
// Router hook for navigation
import { useNavigate } from 'react-router-dom';
// Custom authentication context hook
import { useAuth } from '@/contexts/AuthContext';
// Application components
import { Navbar } from '@/components/Navbar';
// UI components from shadcn/ui library
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
// Supabase client for database operations
import { supabase } from '@/integrations/supabase/client';
// Toast notifications
import { toast } from 'sonner';
// Icons from lucide-react
import { Plus, Trash2 } from 'lucide-react';

// Predefined expense categories for consistent categorization
const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'];

/**
 * Expenses Component - Main page for managing user expenses
 * Provides functionality to view, add, filter, and delete expenses
 */
export default function Expenses() {
  // Authentication state from context - provides current user and loading status
  const { user, loading: authLoading } = useAuth();
  // Navigation hook for redirecting unauthorized users
  const navigate = useNavigate();
  
  // State for storing all user expenses fetched from database
  const [expenses, setExpenses] = useState<any[]>([]);
  // State for controlling the add expense dialog visibility
  const [open, setOpen] = useState(false);
  // State for filtering expenses by category ('all' shows all expenses)
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Form state for new expense input with default values
  const [formData, setFormData] = useState({
    amount: '',                                           // Expense amount as string for input handling
    category: '',                                         // Selected category from CATEGORIES array
    date: new Date().toISOString().split('T')[0],        // Default to today's date in YYYY-MM-DD format
    notes: '',                                            // Optional notes/description
  });

  // Effect: Redirect to authentication page if user is not logged in
  // Runs when authentication state changes
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Effect: Load user's expenses when user is authenticated
  // Runs once when user becomes available after login
  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  /**
   * Fetches all expenses for the current user from Supabase database
   * Orders expenses by date (most recent first) and updates local state
   * Shows error toast if database query fails
   */
  const loadExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      toast.error('Failed to load expenses');
    } else {
      setExpenses(data || []);
    }
  };

  /**
   * Handles form submission for adding a new expense
   * Validates user authentication, creates expense record in database,
   * resets form and refreshes expense list on success
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure user is authenticated before proceeding
    if (!user) return;

    // Insert new expense record into Supabase database
    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,                              // Associate expense with current user
      amount: parseFloat(formData.amount),           // Convert amount string to number
      category: formData.category,                   // Selected category
      date: formData.date,                          // Selected date
      notes: formData.notes || null,                // Optional notes (null if empty)
    });

    if (error) {
      toast.error('Failed to add expense');
    } else {
      toast.success('Expense added successfully');
      // Reset form to initial state
      setFormData({ amount: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
      setOpen(false);          // Close the dialog
      loadExpenses();         // Refresh the expenses list
    }
  };

  /**
   * Handles deletion of an expense by ID
   * Removes expense from database and refreshes the list
   * @param id - Unique identifier of the expense to delete
   */
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete expense');
    } else {
      toast.success('Expense deleted');
      loadExpenses();         // Refresh expenses list after deletion
    }
  };

  // Filter expenses based on selected category
  // Show all expenses if 'all' is selected, otherwise filter by specific category
  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter((exp) => exp.category === filterCategory);

  // Show loading spinner while authentication state is being determined
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Don't render anything if user is not authenticated (will redirect via useEffect)
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation bar component */}
      <Navbar />
      
      {/* Main content area with responsive container */}
      <main className="container mx-auto px-4 py-8">
        {/* Page header with title and add expense button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Expenses</h1>
          
          {/* Dialog for adding new expenses */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              {/* Add expense form with validation */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount input field */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"                                          // Allow decimal amounts
                    min="0"                                              // Prevent negative amounts
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                
                {/* Category selection dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Map through predefined categories to create options */}
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Date input field */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    max={new Date().toISOString().split('T')[0]}    // Prevent future dates
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                
                {/* Optional notes field */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                
                {/* Submit button */}
                <Button type="submit" className="w-full">Add Expense</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Expenses list card with filtering */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Expenses</CardTitle>
              
              {/* Category filter dropdown */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {/* Option to show all categories */}
                  <SelectItem value="all">All Categories</SelectItem>
                  {/* Generate filter options from categories array */}
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Responsive table container */}
            <div className="overflow-x-auto">
              <Table>
                {/* Table header with column names */}
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                
                {/* Table body with expense data */}
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    /* Empty state message when no expenses match filter */
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No expenses found. Add your first expense to get started!
                      </TableCell>
                    </TableRow>
                  ) : (
                    /* Map through filtered expenses to create table rows */
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        {/* Format and display expense date */}
                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                        
                        {/* Category displayed as styled badge */}
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {expense.category}
                          </span>
                        </TableCell>
                        
                        {/* Amount formatted with currency and locale-specific number formatting */}
                        <TableCell className="font-medium">KES {parseFloat(expense.amount).toLocaleString()}</TableCell>
                        
                        {/* Notes with truncation for long text, show dash if empty */}
                        <TableCell className="max-w-xs truncate">{expense.notes || '-'}</TableCell>
                        
                        {/* Delete action button */}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

