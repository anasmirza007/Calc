import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { calculateLandedCost, currency } from "@/lib/calculator";
import { SHIPPING_METHODS, ROUTES } from "@/lib/defaults";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Copy, Save, RotateCcw, Plane, Ship, Package2, Sparkles } from "lucide-react";
import { EMPTY_DRAFT } from "@/context/AppContext";

export default function CalculatorPage() {
  const { config, addCalculation, draft, setDraft } = useApp();
  const form = draft;
  const [touched, setTouched] = useState(false);

  const set = (key, value) => setDraft((f) => ({ ...f, [key]: value }));

  const result = useMemo(() => calculateLandedCost(form, config), [form, config]);
  const errors = result.errors || {};

  const handleSave = () => {
    setTouched(true);
    if (!result.valid) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }
    const record = {
      id: `calc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      input: { ...form },
      result,
    };
    addCalculation(record);
    toast.success(`Saved · ${result.supplierCode}`);
  };

  const handleReset = () => {
    setDraft(EMPTY_DRAFT);
    setTouched(false);
  };

  const copyCode = () => {
    if (!result.valid) return;
    navigator.clipboard?.writeText(result.supplierCode);
    toast.success("Supplier code copied");
  };

  const showErr = (field) => touched && errors[field];

  return (
    <div className="space-y-6">
      <div>
        <p className="overline text-primary">Calculation</p>
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Landed Cost Calculator
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter prices already converted to ZAR. Results update live.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Form */}
        <Card className="rounded-lg border-border p-6 shadow-sm lg:col-span-3" data-testid="calc-form">
          <h3 className="mb-5 font-heading text-lg font-semibold">Inputs</h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Supplier Name" error={showErr("supplierName")}>
              <Input
                data-testid="input-supplier-name"
                value={form.supplierName}
                onChange={(e) => set("supplierName", e.target.value)}
                placeholder="e.g. Mumbai Textiles"
              />
            </Field>

            <Field label="Supplier Code (optional)">
              <Input
                data-testid="input-supplier-code"
                value={form.supplierCode}
                onChange={(e) => set("supplierCode", e.target.value)}
                placeholder="e.g. MT-01"
              />
            </Field>

            <Field label="Product Category" error={showErr("category")}>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {config.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id} data-testid={`category-opt-${c.id}`}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Route" error={showErr("routeId")}>
              <Select value={form.routeId} onValueChange={(v) => set("routeId", v)}>
                <SelectTrigger data-testid="select-route">
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {ROUTES.map((r) => (
                    <SelectItem key={r.id} value={r.id} data-testid={`route-opt-${r.id}`}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Shipping Method" error={showErr("shippingMethod")}>
              <div className="grid grid-cols-2 gap-2">
                {SHIPPING_METHODS.map((m) => {
                  const active = form.shippingMethod === m;
                  const Icon = m === "Air" ? Plane : Ship;
                  return (
                    <button
                      key={m}
                      type="button"
                      data-testid={`method-${m.toLowerCase()}`}
                      onClick={() => set("shippingMethod", m)}
                      className={
                        "flex h-11 items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors " +
                        (active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-white text-muted-foreground hover:bg-secondary")
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {m}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Shipping Time (informational)">
              <Input
                data-testid="input-shipping-time"
                value={form.shippingTime}
                onChange={(e) => set("shippingTime", e.target.value)}
                placeholder="e.g. 12–18 days"
              />
            </Field>

            <Field label="Price per Meter (ZAR)" error={showErr("pricePerMeter")}>
              <Input
                data-testid="input-price-per-meter"
                type="number"
                min="0"
                step="0.01"
                value={form.pricePerMeter}
                onChange={(e) => set("pricePerMeter", e.target.value)}
                placeholder="0.00"
              />
            </Field>

            <Field label="Meters in Roll" error={showErr("metersInRoll")}>
              <Input
                data-testid="input-meters"
                type="number"
                min="0"
                step="0.01"
                value={form.metersInRoll}
                onChange={(e) => set("metersInRoll", e.target.value)}
                placeholder="0"
              />
            </Field>

            <Field label="Weight (kg)" error={showErr("weight")}>
              <Input
                data-testid="input-weight"
                type="number"
                min="0"
                step="0.01"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                placeholder="0.0"
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button data-testid="calc-save-btn" onClick={handleSave} className="rounded-full">
              <Save className="h-4 w-4" />
              Save Calculation
            </Button>
            <Button
              data-testid="calc-reset-btn"
              onClick={handleReset}
              variant="outline"
              className="rounded-full"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </Card>

        {/* Output */}
        <div className="lg:col-span-2">
          <ResultPanel result={result} onCopy={copyCode} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function ResultPanel({ result, onCopy, onSave }) {
  if (!result.valid) {
    return (
      <Card className="sticky top-24 rounded-lg border-dashed border-border p-8 text-center shadow-sm" data-testid="result-empty">
        <Package2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-heading text-lg font-semibold text-foreground">Awaiting valid inputs</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in supplier, category, price, meters and weight to see the landed cost.
        </p>
      </Card>
    );
  }

  const b = result.breakdown;

  return (
    <Card className="sticky top-24 overflow-hidden rounded-lg border-border shadow-sm" data-testid="result-panel">
      {/* Hero output */}
      <div className="bg-slate-900 p-6 text-white">
        <div className="flex items-center justify-between">
          <p className="overline text-white/60">Cost per Meter</p>
          <Badge className="bg-success text-success-foreground hover:bg-success">
            {result.costTier?.label} tier
          </Badge>
        </div>
        <p className="mt-1 font-mono text-5xl font-bold tracking-tighter text-emerald-400" data-testid="result-per-meter">
          {currency(result.costPerMeter)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <div>
            <p className="overline text-white/50">Per Roll</p>
            <p className="font-mono text-lg font-semibold" data-testid="result-per-roll">{currency(result.costPerRoll)}</p>
          </div>
          <div>
            <p className="overline text-white/50">Total Landed</p>
            <p className="font-mono text-lg font-semibold" data-testid="result-total">{currency(result.totalLandedCost)}</p>
          </div>
        </div>
      </div>

      {/* Supplier code */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-6 py-4">
        <div>
          <p className="overline text-muted-foreground">Generated Supplier Code</p>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground" data-testid="result-supplier-code">
            {result.supplierCode}
          </p>
        </div>
        <Button size="icon" variant="outline" onClick={onCopy} data-testid="copy-code-btn" className="rounded-full">
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      {/* Breakdown */}
      <div className="space-y-1 p-6">
        <p className="overline mb-2 text-muted-foreground">Cost Breakdown</p>
        <Row label="Product cost" value={currency(b.productCost)} />
        <Row
          label={`Shipping (${result.weightTier?.label} @ ${currency(b.ratePerKg)}/kg)`}
          value={currency(b.shippingCost)}
        />
        <Row label="Customs duty" value={currency(b.customsDuty)} />
        <Row label="Handling & fees" value={currency(b.handlingFee)} />
        {b.appliedRules.map((r) => (
          <Row key={r.id} label={<span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" />{r.name}</span>} value={currency(r.amount)} />
        ))}
        <Separator className="my-2" />
        <Row label="Subtotal" value={currency(b.subtotal)} muted />
        <Row label="VAT" value={currency(b.tax)} muted />
        <Separator className="my-2" />
        <Row label={<span className="font-semibold text-foreground">Total landed cost</span>} value={<span className="font-bold text-success">{currency(result.totalLandedCost)}</span>} />
      </div>

      {/* Supplier meta */}
      <div className="border-t border-border bg-secondary/30 p-6">
        <p className="overline mb-2 text-muted-foreground">Supplier Details</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Meta label="Category" value={result.category?.name} />
          <Meta label="Route" value={result.routeMeta?.name} />
        </div>
      </div>

      <div className="p-4">
        <Button className="w-full rounded-full" onClick={onSave} data-testid="result-save-btn">
          <Save className="h-4 w-4" /> Save Calculation
        </Button>
      </div>
    </Card>
  );
}

function Row({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>{label}</span>
      <span className={"font-mono " + (muted ? "text-muted-foreground" : "text-foreground")}>{value}</span>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="overline text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
