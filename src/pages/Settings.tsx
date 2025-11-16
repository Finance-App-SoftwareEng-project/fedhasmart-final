import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, UserX, Loader2, Pencil, X, Download, FileText, Calendar } from 'lucide-react';
import { exportFinancialDataToPDF } from '@/lib/pdfExport';

export default function Settings() {
  const { user: supabaseUser } = useAuth();
  const { user: unifiedUser } = useUnifiedAuth();
  
  // Use unified user if available, otherwise fall back to Supabase user
  const user = unifiedUser || supabaseUser;
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'expenses' | 'income' | 'budgets' | 'all'>('all');
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year' | 'all'>('all');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      loadProfile();
    }
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPhone(data.phone || '');
      }
    } catch (error: any) {
      toast.error('Failed to load profile');
    }
  };

  const handlePhoneUpdate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: phone || null })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Phone number updated successfully');
      setIsEditingPhone(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingPhone(false);
    loadProfile();
  };

  const handleExportToPDF = async () => {
    if (!user) return;

    setExporting(true);
    try {
      let dateRangeFilter;
      
      if (dateRange !== 'all') {
        const now = new Date();
        const from = new Date();
        
        switch (dateRange) {
          case 'month':
            from.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            from.setMonth(now.getMonth() - 3);
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

      await exportFinancialDataToPDF(user.id, exportType, dateRangeFilter);
      toast.success('Financial report exported successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export financial data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      await supabase.auth.signOut();
      
      toast.success('Your account has been deleted');
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 mobile-content-padding">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account preferences</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Update your contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-base mt-1">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {!isEditingPhone ? (
                  <div className="flex items-center justify-between">
                    <p className="text-base">{phone || 'Not set'}</p>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingPhone(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1234567890"
                      />
                      <Button onClick={handlePhoneUpdate} disabled={loading}>
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Update
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCancelEdit} disabled={loading}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Include country code (e.g., +254 for Kenya)</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Financial Data
              </CardTitle>
              <CardDescription>
                Download your financial data as a PDF report for record keeping or sharing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="export-type">Data to Export</Label>
                  <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Financial Data</SelectItem>
                      <SelectItem value="expenses">Expenses Only</SelectItem>
                      <SelectItem value="income">Income Only</SelectItem>
                      <SelectItem value="budgets">Budgets Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-range">Time Period</Label>
                  <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last 3 Months</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleExportToPDF} 
                  disabled={exporting}
                  className="flex items-center gap-2"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {exporting ? 'Generating PDF...' : 'Export to PDF'}
                </Button>
                
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-2 sm:mt-0 sm:ml-4">
                  <Calendar className="h-4 w-4" />
                  Export includes formatted tables and summaries
                </div>
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
                <strong>What's included in your PDF export:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {exportType === 'all' && (
                    <>
                      <li>Complete expense history with categories and totals</li>
                      <li>Income records with sources and summaries</li>
                      <li>Budget analysis with spending vs. limits</li>
                      <li>Financial overview and insights</li>
                    </>
                  )}
                  {exportType === 'expenses' && (
                    <>
                      <li>Detailed expense transactions</li>
                      <li>Category-wise spending breakdown</li>
                      <li>Total expenses summary</li>
                    </>
                  )}
                  {exportType === 'income' && (
                    <>
                      <li>Income records by source</li>
                      <li>Monthly income summaries</li>
                      <li>Total income calculations</li>
                    </>
                  )}
                  {exportType === 'budgets' && (
                    <>
                      <li>Budget vs. actual spending analysis</li>
                      <li>Category-wise budget performance</li>
                      <li>Remaining budget summaries</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Profile information</li>
                        <li>Income records</li>
                        <li>Expense records</li>
                        <li>Budgets</li>
                        <li>Financial goals</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? 'Deleting...' : 'Yes, delete my account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
