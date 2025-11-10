import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-foreground">Personal Finance Tracker</h1>
        <p className="text-xl text-muted-foreground">
          Track expenses, set budgets, and achieve your financial goals
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
