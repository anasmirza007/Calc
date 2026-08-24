import React from "react";
import { useApp } from "@/context/AppContext";
import { ROUTES, SHIPPING_METHODS } from "@/lib/defaults";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, RotateCcw, Truck, Scale, Tags, Percent, Layers, Sparkles, Coins } from "lucide-react";

export default function Configuration() {
  const { config, updateConfig, resetToDefaults } = useApp();

  // ---- generic setters ----
  const setField = (key, value) => updateConfig((p) => ({ ...p, [key]: value }));

  const setRate = (routeId, method, tierId, value) =>
    updateConfig((p) => {
      const rates = structuredClone(p.shippingRates);
      rates[routeId] = rates[routeId] || {};
      rates[routeId][method] = rates[routeId][method] || {};
      rates[routeId][method][tierId] = value === "" ? "" : parseFloat(value);
      return { ...p, shippingRates: rates };
    });

  // ---- weight tiers ----
  const addTier = () =>
    updateConfig((p) => {
      const id = `t${Date.now()}`;
      const tiers = [...p.weightTiers, { id, label: "New tier", min: 0, max: null }];
      const rates = structuredClone(p.shippingRates);
      ROUTES.forEach((r) => {
        rates[r.id] = rates[r.id] || {};
        SHIPPING_METHODS.forEach((m) => {
          rates[r.id][m] = rates[r.id][m] || {};
          rates[r.id][m][id] = 0;
        });
      });
      return { ...p, weightTiers: tiers, shippingRates: rates };
    });

  const updateTier = (id, key, value) =>
    updateConfig((p) => ({
      ...p,
      weightTiers: p.weightTiers.map((t) =>
        t.id === id
          ? { ...t, [key]: key === "label" ? value : value === "" ? (key === "max" ? null : "") : parseFloat(value) }
          : t
      ),
    }));

  const removeTier = (id) =>
    updateConfig((p) => {
      const rates = structuredClone(p.shippingRates);
      ROUTES.forEach((r) => SHIPPING_METHODS.forEach((m) => rates[r.id]?.[m] && delete rates[r.id][m][id]));
      return { ...p, weightTiers: p.weightTiers.filter((t) => t.id !== id), shippingRates: rates };
    });

  // ---- categories ----
  const addCategory = () =>
    updateConfig((p) => ({
      ...p,
      categories: [...p.categories, { id: `cat-${Date.now()}`, name: "New category", abbr: "NC" }],
    }));

  const updateCategory = (id, key, value) =>
    updateConfig((p) => ({
      ...p,
      categories: p.categories.map((c) => (c.id === id ? { ...c, [key]: value } : c)),
    }));

  const removeCategory = (id) =>
    updateConfig((p) => ({ ...p, categories: p.categories.filter((c) => c.id !== id) }));

  // ---- cost tiers ----
  const addCostTier = () =>
    updateConfig((p) => ({
      ...p,
      costTiers: [...p.costTiers, { id: (p.costTiers.at(-1)?.id || 0) + 1, label: "New", max: null }],
    }));
  const updateCostTier = (idx, key, value) =>
    updateConfig((p) => ({
      ...p,
      costTiers: p.costTiers.map((t, i) =>
        i === idx ? { ...t, [key]: key === "label" ? value : value === "" ? null : parseFloat(value) } : t
      ),
    }));
  const removeCostTier = (idx) =>
    updateConfig((p) => ({ ...p, costTiers: p.costTiers.filter((_, i) => i !== idx) }));

  // ---- custom rules ----
  const addRule = () =>
    updateConfig((p) => ({
      ...p,
      customRules: [
        ...p.customRules,
        { id: `rule-${Date.now()}`, name: "New rule", category: "any", tierId: "any", routeId: "any", adjustType: "percent", value: 0 },
      ],
    }));
  const updateRule = (id, key, value) =>
    updateConfig((p) => ({
      ...p,
      customRules: p.customRules.map((r) =>
        r.id === id ? { ...r, [key]: key === "value" ? (value === "" ? "" : parseFloat(value)) : value } : r
      ),
    }));
  const removeRule = (id) =>
    updateConfig((p) => ({ ...p, customRules: p.customRules.filter((r) => r.id !== id) }));

  // ---- exchange rates ----
  const setRateRef = (key, value) =>
    updateConfig((p) => ({
      ...p,
      exchangeRates: { ...p.exchangeRates, [key]: value === "" ? "" : parseFloat(value), updatedAt: new Date().toISOString() },
    }));

  const handleReset = () => {
    resetToDefaults();
    toast.success("Configuration reset to defaults");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="overline text-primary">Settings</p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Configuration</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All pricing factors are editable and saved to your browser automatically.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="rounded-full" data-testid="reset-config-btn">
              <RotateCcw className="h-4 w-4" /> Reset to defaults
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset configuration?</AlertDialogTitle>
              <AlertDialogDescription>
                This restores all shipping rates, tiers, fees and rules to their default values. Your calculation history is kept.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset} data-testid="confirm-reset-btn">Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="rounded-lg border-border p-2 shadow-sm sm:p-4">
        <Accordion type="multiple" defaultValue={["shipping"]} className="w-full">
          {/* Shipping rates */}
          <Section value="shipping" icon={Truck} title="Shipping Rates (ZAR per kg)" subtitle="Configured independently per route, method & weight tier">
            {ROUTES.map((route) => (
              <div key={route.id} className="mb-6 last:mb-0" data-testid={`rates-route-${route.id}`}>
                <p className="mb-2 font-heading text-sm font-semibold text-foreground">{route.name}</p>
                <div className="overflow-x-auto rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Weight Tier</TableHead>
                        {SHIPPING_METHODS.map((m) => (
                          <TableHead key={m} className="text-right">{m}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {config.weightTiers.map((tier) => (
                        <TableRow key={tier.id}>
                          <TableCell className="font-medium">{tier.label}</TableCell>
                          {SHIPPING_METHODS.map((m) => (
                            <TableCell key={m} className="text-right">
                              <Input
                                data-testid={`rate-${route.id}-${m}-${tier.id}`}
                                type="number"
                                min="0"
                                step="0.01"
                                className="ml-auto h-9 w-24 text-right font-mono"
                                value={config.shippingRates?.[route.id]?.[m]?.[tier.id] ?? ""}
                                onChange={(e) => setRate(route.id, m, tier.id, e.target.value)}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </Section>

          {/* Weight tiers */}
          <Section value="tiers" icon={Scale} title="Weight Tiers" subtitle="Boundaries used to pick shipping rates">
            <div className="space-y-3">
              {config.weightTiers.map((tier) => (
                <div key={tier.id} className="grid grid-cols-12 items-end gap-2" data-testid={`tier-row-${tier.id}`}>
                  <MiniField className="col-span-5 sm:col-span-4" label="Label">
                    <Input value={tier.label} onChange={(e) => updateTier(tier.id, "label", e.target.value)} className="h-9" />
                  </MiniField>
                  <MiniField className="col-span-3 sm:col-span-3" label="Min kg">
                    <Input type="number" min="0" value={tier.min} onChange={(e) => updateTier(tier.id, "min", e.target.value)} className="h-9 font-mono" />
                  </MiniField>
                  <MiniField className="col-span-3 sm:col-span-4" label="Max kg (blank = ∞)">
                    <Input type="number" min="0" value={tier.max ?? ""} onChange={(e) => updateTier(tier.id, "max", e.target.value)} className="h-9 font-mono" placeholder="∞" />
                  </MiniField>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" onClick={() => removeTier(tier.id)} data-testid={`remove-tier-${tier.id}`} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={addTier} testid="add-tier-btn">Add weight tier</AddButton>
          </Section>

          {/* Categories */}
          <Section value="categories" icon={Tags} title="Product Categories" subtitle="Name & 2-letter abbreviation used in supplier codes">
            <div className="space-y-3">
              {config.categories.map((c) => (
                <div key={c.id} className="grid grid-cols-12 items-end gap-2" data-testid={`category-row-${c.id}`}>
                  <MiniField className="col-span-7 sm:col-span-8" label="Name">
                    <Input value={c.name} onChange={(e) => updateCategory(c.id, "name", e.target.value)} className="h-9" />
                  </MiniField>
                  <MiniField className="col-span-4 sm:col-span-3" label="Abbr">
                    <Input value={c.abbr} maxLength={3} onChange={(e) => updateCategory(c.id, "abbr", e.target.value.toUpperCase())} className="h-9 font-mono uppercase" />
                  </MiniField>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" onClick={() => removeCategory(c.id)} data-testid={`remove-category-${c.id}`} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={addCategory} testid="add-category-btn">Add category</AddButton>
          </Section>

          {/* Duties, fees & tax */}
          <Section value="fees" icon={Percent} title="Duties, Fees & Tax" subtitle="Applied uniformly across all categories">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumField label="Customs duty (% of product cost)" value={config.customsDutyRate} onChange={(v) => setField("customsDutyRate", v)} testid="config-customs-duty" />
              <NumField label="Handling fee (% of product cost)" value={config.handlingFeeRate} onChange={(v) => setField("handlingFeeRate", v)} testid="config-handling-percent" />
              <NumField label="Handling flat fee (ZAR per roll)" value={config.handlingFeeFlat} onChange={(v) => setField("handlingFeeFlat", v)} testid="config-handling-flat" />
              <NumField label="VAT / tax (% of subtotal)" value={config.taxRate} onChange={(v) => setField("taxRate", v)} testid="config-tax" />
            </div>
          </Section>

          {/* Cost tiers */}
          <Section value="costtiers" icon={Layers} title="Cost Tier Bands" subtitle="Auto-derived tier indicator in supplier code, by cost/meter">
            <div className="space-y-3">
              {config.costTiers.map((t, idx) => (
                <div key={idx} className="grid grid-cols-12 items-end gap-2" data-testid={`costtier-row-${idx}`}>
                  <MiniField className="col-span-3" label="ID">
                    <Input type="number" value={t.id} onChange={(e) => updateCostTier(idx, "id", e.target.value)} className="h-9 font-mono" />
                  </MiniField>
                  <MiniField className="col-span-4" label="Label">
                    <Input value={t.label} onChange={(e) => updateCostTier(idx, "label", e.target.value)} className="h-9" />
                  </MiniField>
                  <MiniField className="col-span-4" label="Max R/m (blank = top)">
                    <Input type="number" value={t.max ?? ""} onChange={(e) => updateCostTier(idx, "max", e.target.value)} className="h-9 font-mono" placeholder="∞" />
                  </MiniField>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" onClick={() => removeCostTier(idx)} data-testid={`remove-costtier-${idx}`} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={addCostTier} testid="add-costtier-btn">Add cost tier</AddButton>
          </Section>

          {/* Custom rules */}
          <Section value="rules" icon={Sparkles} title="Custom Pricing Rules" subtitle="Extra charges by category + weight tier + route">
            <div className="space-y-4">
              {config.customRules.length === 0 && (
                <p className="text-sm text-muted-foreground">No custom rules yet.</p>
              )}
              {config.customRules.map((rule) => (
                <div key={rule.id} className="rounded-md border border-border p-3" data-testid={`rule-row-${rule.id}`}>
                  <div className="mb-3 flex items-center gap-2">
                    <Input value={rule.name} onChange={(e) => updateRule(rule.id, "name", e.target.value)} className="h-9 font-medium" placeholder="Rule name" />
                    <Button variant="ghost" size="icon" onClick={() => removeRule(rule.id)} data-testid={`remove-rule-${rule.id}`} className="shrink-0 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <MiniField label="Category">
                      <SelectBox value={rule.category} onChange={(v) => updateRule(rule.id, "category", v)} options={[{ value: "any", label: "Any" }, ...config.categories.map((c) => ({ value: c.id, label: c.name }))]} />
                    </MiniField>
                    <MiniField label="Weight tier">
                      <SelectBox value={rule.tierId} onChange={(v) => updateRule(rule.id, "tierId", v)} options={[{ value: "any", label: "Any" }, ...config.weightTiers.map((t) => ({ value: t.id, label: t.label }))]} />
                    </MiniField>
                    <MiniField label="Route">
                      <SelectBox value={rule.routeId} onChange={(v) => updateRule(rule.id, "routeId", v)} options={[{ value: "any", label: "Any" }, ...ROUTES.map((r) => ({ value: r.id, label: r.source }))]} />
                    </MiniField>
                    <MiniField label="Type">
                      <SelectBox value={rule.adjustType} onChange={(v) => updateRule(rule.id, "adjustType", v)} options={[{ value: "percent", label: "% of cost" }, { value: "flat", label: "Flat ZAR" }]} />
                    </MiniField>
                    <MiniField label="Value">
                      <Input type="number" value={rule.value} onChange={(e) => updateRule(rule.id, "value", e.target.value)} className="h-9 font-mono" />
                    </MiniField>
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={addRule} testid="add-rule-btn">Add custom rule</AddButton>
          </Section>

          {/* Exchange rates */}
          <Section value="exchange" icon={Coins} title="Exchange Rates (reference only)" subtitle="Displayed for manual conversion — never applied automatically">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumField label="1 INR = ? ZAR" value={config.exchangeRates?.inrToZar} onChange={(v) => setRateRef("inrToZar", v)} testid="config-inr" step="0.0001" />
              <NumField label="1 CNY = ? ZAR" value={config.exchangeRates?.cnyToZar} onChange={(v) => setRateRef("cnyToZar", v)} testid="config-cny" step="0.0001" />
            </div>
          </Section>
        </Accordion>
      </Card>
    </div>
  );
}

function Section({ value, icon: Icon, title, subtitle, children }) {
  return (
    <AccordionItem value={value} className="border-border">
      <AccordionTrigger className="px-2 hover:no-underline" data-testid={`section-${value}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-left">
            <p className="font-heading text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs font-normal text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 pt-2">{children}</AccordionContent>
    </AccordionItem>
  );
}

function MiniField({ label, children, className = "" }) {
  return (
    <div className={"space-y-1 " + className}>
      <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function NumField({ label, value, onChange, testid, step = "0.01" }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <Input
        data-testid={testid}
        type="number"
        min="0"
        step={step}
        className="font-mono"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
      />
    </div>
  );
}

function SelectBox({ value, onChange, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function AddButton({ onClick, children, testid }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} data-testid={testid} className="mt-4 rounded-full">
      <Plus className="h-4 w-4" /> {children}
    </Button>
  );
}
