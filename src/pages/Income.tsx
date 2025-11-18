/**
 * Income Page Component
 * 
 * Provides functionality for tracking and managing income entries:
 * - Add new income entries with source, amount, date, and notes
 * - View income history in a chronological list
 * - Delete existing income entries
 * - Export income data to PDF
 * 
 * Supports multiple income sources: Salary, Freelance, Business, Investment, Gift, Other
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Trash2, Download, Plus } from "lucide-react";
import { exportFinancialDataToPDF } from '@/lib/pdfExport';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";

/**
 * Income entry interface
 * Represents a single income transaction in the database
 */
interface Income {
  id: string; // Unique identifier
  amount: number; // Income amount in KES
  source: string; // Source of income (e.g., "Salary", "Freelance")
  date: string; // Date of income (ISO date string)
  notes: string | null; // Optional notes about the income
}

/**
 * Predefined income sources
 * Provides consistent categorization for income tracking
 */
const INCOME_SOURCES = ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"];

/**
 * Income Component
 * 
 * Main component for income management. Handles:
 * - Authentication (supports both auth systems)
 * - Income CRUD operations
 * - PDF export functionality
 */
export default function Income() {
  // Authentication hooks - support both auth systems
  const { user: supabaseUser } = useAuth();
  const { user: unifiedUser } = useUnifiedAuth();
  
  // Prioritize unified user, fall back to Supabase user
  const user = unifiedUser || supabaseUser;
  const { toast } = useToast();
  
  // Component state
  const [income, setIncome] = useState<Income[]>([]); // List of all income entries
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [exportingPDF, setExportingPDF] = useState(false); // Loading state for PDF export
  const [newIncome, setNewIncome] = useState({
    amount: "", // Income amount (string for input handling)
    source: "", // Income source category
    date: format(new Date(), "yyyy-MM-dd"), // Default to today's date
    notes: "", // Optional notes
  });

  // Fetch income data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchIncome();
    }
  }, [user]);

  /**
   * Fetch all income entries from database
   * Orders by date (most recent first) for better UX
   */
  const fetchIncome = async () => {
    try {
      const { data, error } = await supabase
        .from("income")
        .select("*")
        .order("date", { ascending: false }); // Most recent first

      if (error) throw error;
      setIncome(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Handle form submission for adding new income
   * 
   * Validates user authentication, inserts new income entry,
   * shows success/error feedback, and refreshes the income list.
   * 
   * @param e - Form submission event
   */
  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Insert new income entry into database
      const { error } = await supabase.from("income").insert([
        {
          user_id: user.id, // Associate with current user
          amount: parseFloat(newIncome.amount), // Convert string to number
          source: newIncome.source,
          date: newIncome.date,
          notes: newIncome.notes || null, // Handle empty notes
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Income added successfully",
      });

      // Reset form to initial state
      setNewIncome({
        amount: "",
        source: "",
        date: format(new Date(), "yyyy-MM-dd"), // Reset to today
        notes: "",
      });

      // Refresh income list to show new entry
      fetchIncome();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle income deletion
   * 
   * Deletes an income entry by ID and refreshes the list.
   * 
   * @param id - Unique identifier of income entry to delete
   */
  const handleDeleteIncome = async (id: string) => {
    try {
      const { error } = await supabase.from("income").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Income deleted successfully",
      });

      // Refresh income list to reflect deletion
      fetchIncome();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Handle PDF export of income data
   * 
   * Exports all income entries to a PDF file for record keeping.
   * Requires user authentication.
   */
  const handleExportIncome = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to export income data",
        variant: "destructive",
      });
      return;
    }

    setExportingPDF(true);
    try {
      await exportFinancialDataToPDF(user.id, 'income');
      toast({
        title: "Success",
        description: "Income data exported to PDF successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export income data",
        variant: "destructive",
      });
    } finally {
      setExportingPDF(false);
    }
  };

  // UI Layout and rendering
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 mobile-content-padding">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Income Tracker</h1>
          <Button 
            variant="outline" 
            onClick={handleExportIncome}
            disabled={exportingPDF || income.length === 0}
            className="flex items-center gap-2 touch-target w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            {exportingPDF ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>

      <div className="grid gap-4 sm:gap-8 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Add New Income</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddIncome} className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="amount" className="text-sm">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  required
                  value={newIncome.amount}
                  onChange={(e) =>
                    setNewIncome({ ...newIncome, amount: e.target.value })
                  }
                  placeholder="0.00"
                  className="touch-target"
                />
              </div>

              <div>
                <Label htmlFor="source" className="text-sm">Source</Label>
                <Select
                  value={newIncome.source}
                  onValueChange={(value) =>
                    setNewIncome({ ...newIncome, source: value })
                  }
                  required
                >
                  <SelectTrigger className="touch-target">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOME_SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date" className="text-sm">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={newIncome.date}
                  onChange={(e) =>
                    setNewIncome({ ...newIncome, date: e.target.value })
                  }
                  className="touch-target"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newIncome.notes}
                  onChange={(e) =>
                    setNewIncome({ ...newIncome, notes: e.target.value })
                  }
                  placeholder="Add any additional details..."
                  className="touch-target resize-none"
                />
              </div>

              <Button type="submit" className="w-full touch-target" disabled={loading}>
                {loading ? "Adding..." : "Add Income"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Income History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {income.length === 0 ? (
                <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm sm:text-base">
                  No income recorded yet
                </p>
              ) : (
                income.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg touch-target hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-base sm:text-lg">
                          KES {Number(item.amount).toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          • {item.source}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {format(new Date(item.date), "MMM dd, yyyy")}
                      </p>
                      {item.notes && (
                        <p className="text-xs sm:text-sm mt-1 sm:mt-2 break-words">{item.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteIncome(item.id)}
                      className="touch-target flex-shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
}
