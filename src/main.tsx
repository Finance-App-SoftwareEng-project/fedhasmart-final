import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { UnifiedAuthProvider } from "@/contexts/UnifiedAuthContext";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <FirebaseAuthProvider>
      <UnifiedAuthProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </UnifiedAuthProvider>
    </FirebaseAuthProvider>
  </BrowserRouter>
);
