import React, { useState } from "react";
import { Package, LayoutDashboard, Calculator as CalcIcon, Settings2, Users, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import { rateFmt } from "@/lib/calculator";
import { useApp } from "@/context/AppContext";
import Dashboard from "@/pages/Dashboard";
import CalculatorPage from "@/pages/CalculatorPage";
import Configuration from "@/pages/Configuration";
import Suppliers from "@/pages/Suppliers";
import Products from "@/pages/Products";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "calculate", label: "Calculate", icon: CalcIcon },
  { id: "suppliers", label: "Suppliers", icon: Users },
  { id: "products", label: "Products", icon: Boxes },
  { id: "config", label: "Config", icon: Settings2 },
];

export default function Shell() {
  const [tab, setTab] = useState("dashboard");
  const { config } = useApp();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <h1 className="font-heading text-base font-bold text-foreground sm:text-lg">LandedCost</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">Import pricing for South Africa</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 rounded-full border border-border bg-secondary/60 p-1 lg:flex">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  data-testid={`nav-${item.id}`}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-white hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 rounded-lg border border-border bg-white px-3 py-1.5 text-xs md:flex">
            <RateChip label="INR→ZAR" value={config.currencyRates?.INR} />
            <span className="h-4 w-px bg-border" />
            <RateChip label="CNY→ZAR" value={config.currencyRates?.CNY} />
          </div>
        </div>

        {/* Tablet nav row */}
        <div className="hidden border-t border-border md:block lg:hidden">
          <div className="mx-auto flex max-w-6xl gap-1 px-4 py-2">
            {NAV.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {tab === "dashboard" && <Dashboard onNavigate={setTab} />}
        {tab === "calculate" && <CalculatorPage onNavigate={setTab} />}
        {tab === "suppliers" && <Suppliers onNavigate={setTab} />}
        {tab === "products" && <Products onNavigate={setTab} />}
        {tab === "config" && <Configuration />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-border bg-white/90 backdrop-blur-xl md:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              data-testid={`mobile-nav-${item.id}`}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function RateChip({ label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="overline text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-semibold text-foreground">{rateFmt(value)}</span>
    </div>
  );
}
