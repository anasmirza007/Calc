import React from "react";
import "@/App.css";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";
import Shell from "@/components/Shell";

export default function App() {
  return (
    <AppProvider>
      <div className="App">
        <Shell />
        <Toaster position="bottom-right" richColors />
      </div>
    </AppProvider>
  );
}
