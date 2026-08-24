import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { currency, rateFmt } from "@/lib/calculator";
import { printQuote } from "@/lib/quote";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Boxes,
  Ruler,
  Plus,
  ArrowRight,
  IndianRupee,
  Coins,
  History,
  Trash2,
  Search,
  CopyPlus,
  Printer,
} from "lucide-react";

export default function Dashboard({ onNavigate }) {
  const { history, config, deleteCalculation, clearHistory, setDraft } = useApp();
  const [query, setQuery] = useState("");

  const reuse = (rec) => {
    setDraft({ ...rec.input });
    onNavigate("calculate");
  };

  const q = query.trim().toLowerCase();
  const filtered = history.filter((r) => {
    if (!q) return true;
    return [
      r.input?.supplierName,
      r.input?.supplierCode,
      r.result?.supplierCode,
      r.result?.category?.name,
      r.result?.routeMeta?.name,
      r.input?.shippingMethod,
    ].some((v) => String(v || "").toLowerCase().includes(q));
  });
  const visible = q ? filtered.slice(0, 15) : filtered.slice(0, 6);

  const totalCalcs = history.length;
  const avgPerMeter =
    totalCalcs > 0
      ? history.reduce((s, r) => s + (r.result?.costPerMeter || 0), 0) / totalCalcs
      : 0;
  const totalValue = history.reduce((s, r) => s + (r.result?.totalLandedCost || 0), 0);
  const latest = history[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="overline text-primary">Overview</p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent landed-cost calculations and key metrics.
          </p>
        </div>
        <Button
          data-testid="dashboard-new-calc-btn"
          onClick={() => onNavigate("calculate")}
          className="rounded-full"
        >
          <Plus className="h-4 w-4" />
          New Calculation
        </Button>
      </div>

      {/* Metrics bento */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          testid="metric-total-calcs"
          icon={Boxes}
          label="Calculations"
          value={totalCalcs}
          tone="primary"
        />
        <MetricCard
          testid="metric-avg-per-meter"
          icon={Ruler}
          label="Avg Cost / Meter"
          value={currency(avgPerMeter)}
          tone="success"
        />
        <MetricCard
          testid="metric-total-value"
          icon={TrendingUp}
          label="Total Landed Value"
          value={currency(totalValue)}
          tone="default"
        />
      </div>

      {/* Latest + exchange rates */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="col-span-1 rounded-lg border-border p-6 shadow-sm lg:col-span-2" data-testid="latest-calc-card">
          <div className="mb-4 flex items-center justify-between">
            <p className="overline text-muted-foreground">Most Recent</p>
            {latest && <Badge variant="secondary" className="font-mono">{latest.result?.supplierCode}</Badge>}
          </div>
          {latest ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{latest.input?.supplierName}</p>
                  <p className="font-heading text-lg font-semibold text-foreground">
                    {latest.result?.category?.name} · {latest.result?.routeMeta?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="overline text-success">Cost / Meter</p>
                  <p className="font-mono text-4xl font-bold tracking-tighter text-success">
                    {currency(latest.result?.costPerMeter)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
                <MiniStat label="Total Landed" value={currency(latest.result?.totalLandedCost)} />
                <MiniStat label="Per Roll" value={currency(latest.result?.costPerRoll)} />
                <MiniStat label="Meters" value={latest.input?.metersInRoll} />
                <MiniStat label="Weight" value={`${latest.input?.weight} kg`} />
              </div>
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => reuse(latest)} data-testid="latest-reuse-btn">
                  <CopyPlus className="h-4 w-4" /> Reuse
                </Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => printQuote(latest)} data-testid="latest-export-btn">
                  <Printer className="h-4 w-4" /> Export PDF
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState onNavigate={onNavigate} />
          )}
        </Card>

        <Card className="rounded-lg border-border p-6 shadow-sm" data-testid="exchange-rates-card">
          <p className="overline text-muted-foreground">Exchange Rates (reference)</p>
          <p className="mb-4 mt-1 text-xs text-muted-foreground">
            Convert prices to ZAR manually before entering.
          </p>
          <div className="space-y-3">
            <RateRow icon={IndianRupee} label="1 INR" value={config.currencyRates?.INR} />
            <RateRow icon={Coins} label="1 CNY" value={config.currencyRates?.CNY} />
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Edit these in the Configuration tab.
          </p>
        </Card>
      </div>

      {/* Recent history */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-heading text-lg font-semibold">Recent Calculations</h3>
          </div>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              data-testid="clear-history-btn"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Clear all
            </Button>
          )}
        </div>

        {history.length > 0 && (
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid="history-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by supplier, code, category or route…"
              className="pl-9"
            />
          </div>
        )}

        {history.length === 0 ? (
          <Card className="rounded-lg border-dashed p-8 text-center text-sm text-muted-foreground">
            No calculations yet.
          </Card>
        ) : visible.length === 0 ? (
          <Card className="rounded-lg border-dashed p-8 text-center text-sm text-muted-foreground" data-testid="history-no-results">
            No calculations match “{query}”.
          </Card>
        ) : (
          <div className="space-y-2">
            {visible.map((r, i) => (
              <Card
                key={r.id}
                data-testid={`history-row-${i}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-border p-4 shadow-sm transition-transform hover:-translate-y-[1px] hover:shadow-md animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-xs">{r.result?.supplierCode}</Badge>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.input?.supplierName}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.result?.category?.name} · {r.result?.routeMeta?.source} · {r.input?.shippingMethod}
                      {r.timestamp && <span> · {new Date(r.timestamp).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="mr-2 text-right">
                    <p className="font-mono text-lg font-bold text-success">{currency(r.result?.costPerMeter)}<span className="text-xs font-normal text-muted-foreground">/m</span></p>
                    <p className="text-xs text-muted-foreground">{currency(r.result?.totalLandedCost)} total</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => reuse(r)} data-testid={`reuse-calc-${i}`} className="text-muted-foreground hover:text-primary" title="Reuse">
                    <CopyPlus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => printQuote(r)} data-testid={`export-calc-${i}`} className="text-muted-foreground hover:text-primary" title="Export PDF">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCalculation(r.id)} data-testid={`delete-calc-${i}`} className="text-muted-foreground hover:text-destructive" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone, testid }) {
  const tones = {
    primary: "text-primary",
    success: "text-success",
    default: "text-foreground",
  };
  return (
    <Card className="rounded-lg border-border p-6 shadow-sm" data-testid={testid}>
      <div className="mb-3 flex items-center justify-between">
        <p className="overline text-muted-foreground">{label}</p>
        <Icon className={`h-5 w-5 ${tones[tone]}`} />
      </div>
      <p className={`font-mono text-3xl font-bold tracking-tighter ${tones[tone]}`}>{value}</p>
    </Card>
  );
}

function MiniStat({ label, value }) {
  return (
    <div>
      <p className="overline text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function RateRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-secondary/60 px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </div>
      <span className="font-mono text-sm font-semibold text-foreground">
        R {rateFmt(value)}
      </span>
    </div>
  );
}

function EmptyState({ onNavigate }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-sm text-muted-foreground">No calculations yet.</p>
      <Button
        variant="link"
        className="text-primary"
        onClick={() => onNavigate("calculate")}
        data-testid="empty-new-calc-btn"
      >
        Create your first calculation <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
