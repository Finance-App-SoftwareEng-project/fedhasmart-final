/**
 * Main Application Entry Point
 * 
 * This file initializes the React application and sets up the core providers.
 * It wraps the app with necessary context providers for routing, authentication,
 * and UI components (tooltips).
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UnifiedAuthProvider } from "@/contexts/UnifiedAuthContext";
import { BrowserRouter } from "react-router-dom";

// Initialize React root and render application with required providers
// Provider hierarchy (outer to inner):
// 1. BrowserRouter - Enables client-side routing
// 2. UnifiedAuthProvider - Provides authentication state and methods
// 3. TooltipProvider - Enables tooltip functionality across the app
// 4. App - Main application component
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <UnifiedAuthProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </UnifiedAuthProvider>
  </BrowserRouter>
);
