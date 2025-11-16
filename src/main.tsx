import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UnifiedAuthProvider } from "@/contexts/UnifiedAuthContext";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <UnifiedAuthProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </UnifiedAuthProvider>
  </BrowserRouter>
);
