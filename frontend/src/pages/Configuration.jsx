import React, { useRef } from "react";
import { useApp } from "@/context/AppContext";
import { ROUTES, SHIPPING_METHODS, CURRENCIES } from "@/lib/defaults";
import { normaliseConfig } from "@/lib/storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, RotateCcw, Truck, Tags, Percent, Layers, Sparkles, Coins, Download, Upload } from "lucide-react";

export default function Configuration() {
  const { config, setConfig, updateConfig, resetToDefaults } = useApp();
  const fileRef = useRef(null);

  const setField = (key, value) => updateConfig((p) => ({ ...p, [key]: value }));

  const setRate = (routeId, method, value) =>
    updateConfig((p) => {
      const rates = structuredClone(p.shippingRates);
      rates[routeId] = rates[routeId] || {};
      rates[routeId][method] = value === "" ? "" : parseFloat(value);
      return { ...p, shippingRates: rates };
    });

  const setCurrencyRate = (code, value) =>
    updateConfig((p) => ({ ...p, currencyRates: { ...p.currencyRates, [code]: value === "" ? "" : parseFloat(value) } }));

  // Categories
  const addCategory = () =>
    updateConfig((p) => ({ ...p, categories: [...p.categories, { id: `cat-${Date.now()}`, name: "New category", abbr: "NC", subCategories: [] }] }));
  const updateCategory = (id, key, value) =>
    updateConfig((p) => ({ ...p, categories: p.categories.map((c) => (c.id === id ? { ...c, [key]: value } : c)) }));
  const setSubCats = (id, text) =>
    updateConfig((p) => ({ ...p, categories: p.categories.map((c) => (c.id === id ? { ...c, subCategories: text.split(",").map((s) => s.trim()).filter(Boolean) } : c)) }));
  const removeCategory = (id) => updateConfig((p) => ({ ...p, categories: p.categories.filter((c) => c.id !== id) }));

  // Cost tiers
  const addCostTier = () =>
    updateConfig((p) => ({ ...p, costTiers: [...p.costTiers, { id: (p.costTiers.at(-1)?.id || 0) + 1, label: "New", max: null }] }));
  const updateCostTier = (idx, key, value) =>
    updateConfig((p) => ({ ...p, costTiers: p.costTiers.map((t, i) => (i === idx ? { ...t, [key]: key === "label" ? value : value === "" ? null : parseFloat(value) } : t)) }));
  const removeCostTier = (idx) => updateConfig((p) => ({ ...p, costTiers: p.costTiers.filter((_, i) => i !== idx) }));

  // Custom rules (category + route)
  const addRule = () =>
    updateConfig((p) => ({ ...p, customRules: [...p.customRules, { id: `rule-${Date.now()}`, name: "New rule", category: "any", routeId: "any", adjustType: "percent", value: 0 }] }));
  const updateRule = (id, key, value) =>
    updateConfig((p) => ({ ...p, customRules: p.customRules.map((r) => (r.id === id ? { ...r, [key]: key === "value" ? (value === "" ? "" : parseFloat(value)) : value } : r)) }));
  const removeRule = (id) => updateConfig((p) => ({ ...p, customRules: p.customRules.filter((r) => r.id !== id) }));

  const handleReset = () => { resetToDefaults(); toast.success("Configuration reset to defaults"); };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `landedcost-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    toast.success("Configuration exported");
  };

  const importConfig = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.categories) || !data.shippingRates) throw new Error("Invalid shape");
        setConfig(normaliseConfig(data));
        toast.success("Configuration imported");
      } catch {
        toast.error("Invalid configuration file");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="overline text-primary">Settings</p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Configuration</h2>
          <p className="mt-1 text-sm text-muted-foreground">All pricing factors are editable and saved to your browser automatically.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importConfig} data-testid="import-config-input" />
          <Button variant="outline" className="rounded-full" onClick={exportConfig} data-testid="export-config-btn"><Download className="h-4 w-4" /> Export</Button>
          <Button variant="outline" className="rounded-full" onClick={() => fileRef.current?.click()} data-testid="import-config-btn"><Upload className="h-4 w-4" /> Import</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-full" data-testid="reset-config-btn"><RotateCcw className="h-4 w-4" /> Reset</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset configuration?</AlertDialogTitle>
                <AlertDialogDescription>This restores all shipping rates, fees and rules to their default values. Your calculation history, suppliers and products are kept.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} data-testid="confirm-reset-btn">Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="rounded-lg border-border p-2 shadow-sm sm:p-4">
        <Accordion type="multiple" defaultValue={["shipping"]} className="w-full">
          {/* Shipping rates */}
          <Section value="shipping" icon={Truck} title="Shipping Rates (per kg)" subtitle="Flat rate per kg in each route's source currency, converted to ZAR">
            {ROUTES.map((route) => (
              <div key={route.id} className="mb-6 last:mb-0" data-testid={`rates-route-${route.id}`}>
                <p className="mb-2 font-heading text-sm font-semibold text-foreground">{route.name} <span className="font-normal text-muted-foreground">· rates in {route.currency}/kg</span></p>
                <div className="overflow-x-auto rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {SHIPPING_METHODS.map((m) => <TableHead key={m} className="text-right">{m}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        {SHIPPING_METHODS.map((m) => (
                          <TableCell key={m} className="text-right">
                            <Input
                              data-testid={`rate-${route.id}-${m.toLowerCase().replace(/[^a-z]/g, "")}`}
                              type="number" min="0" step="0.01"
                              className="ml-auto h-9 w-28 text-right font-mono"
                              value={config.shippingRates?.[route.id]?.[m] ?? ""}
                              onChange={(e) => setRate(route.id, m, e.target.value)}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </Section>

          {/* Currency rates */}
          <Section value="currency" icon={Coins} title="Currency Rates" subtitle="1 unit = ? ZAR. Used to auto-convert buying prices & shipping">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {CURRENCIES.map((c) => (
                <div key={c} className="space-y-2">
                  <Label className="text-sm font-medium">1 {c} = ? ZAR</Label>
                  <Input
                    data-testid={`currency-rate-${c}`}
                    type="number" min="0" step="0.0001" className="font-mono"
                    value={config.currencyRates?.[c] ?? ""}
                    disabled={c === "ZAR"}
                    onChange={(e) => setCurrencyRate(c, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* Categories */}
          <Section value="categories" icon={Tags} title="Categories & Sub-categories" subtitle="Name, code abbreviation and comma-separated sub-categories">
            <div className="space-y-4">
              {config.categories.map((c) => (
                <div key={c.id} className="rounded-md border border-border p-3" data-testid={`category-row-${c.id}`}>
                  <div className="grid grid-cols-12 items-end gap-2">
                    <MiniField className="col-span-6 sm:col-span-4" label="Name">
                      <Input value={c.name} onChange={(e) => updateCategory(c.id, "name", e.target.value)} className="h-9" />
                    </MiniField>
                    <MiniField className="col-span-3 sm:col-span-2" label="Abbr">
                      <Input value={c.abbr} maxLength={3} onChange={(e) => updateCategory(c.id, "abbr", e.target.value.toUpperCase())} className="h-9 font-mono uppercase" />
                    </MiniField>
                    <MiniField className="col-span-3 sm:col-span-3" label="Duty %">
                      <Input type="number" min="0" step="0.1" value={c.dutyRate ?? ""} onChange={(e) => updateCategory(c.id, "dutyRate", e.target.value === "" ? "" : parseFloat(e.target.value))} className="h-9 font-mono" data-testid={`category-duty-${c.id}`} />
                    </MiniField>
                    <div className="col-span-12 sm:col-span-3 flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => removeCategory(c.id)} data-testid={`remove-category-${c.id}`} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <MiniField className="mt-2" label="Sub-categories (comma separated)">
                    <Input value={(c.subCategories || []).join(", ")} onChange={(e) => setSubCats(c.id, e.target.value)} className="h-9" placeholder="e.g. Cotton Lace, Net Lace" data-testid={`subcats-${c.id}`} />
                  </MiniField>
                </div>
              ))}
            </div>
            <AddButton onClick={addCategory} testid="add-category-btn">Add category</AddButton>
          </Section>

          {/* Duties, fees & tax */}
          <Section value="fees" icon={Percent} title="Duty, Fees & Tax" subtitle="Default duty is a fallback; each category can override it">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumField label="Default duty rate (%) — fallback" value={config.dutyRate} onChange={(v) => setField("dutyRate", v)} testid="config-duty-rate" />
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
                  <MiniField className="col-span-3" label="ID"><Input type="number" value={t.id} onChange={(e) => updateCostTier(idx, "id", e.target.value)} className="h-9 font-mono" /></MiniField>
                  <MiniField className="col-span-4" label="Label"><Input value={t.label} onChange={(e) => updateCostTier(idx, "label", e.target.value)} className="h-9" /></MiniField>
                  <MiniField className="col-span-4" label="Max R/m (blank = top)"><Input type="number" value={t.max ?? ""} onChange={(e) => updateCostTier(idx, "max", e.target.value)} className="h-9 font-mono" placeholder="∞" /></MiniField>
                  <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => removeCostTier(idx)} data-testid={`remove-costtier-${idx}`} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></div>
                </div>
              ))}
            </div>
            <AddButton onClick={addCostTier} testid="add-costtier-btn">Add cost tier</AddButton>
          </Section>

          {/* Custom rules */}
          <Section value="rules" icon={Sparkles} title="Custom Pricing Rules" subtitle="Extra charges by category + route">
            <div className="space-y-4">
              {config.customRules.length === 0 && <p className="text-sm text-muted-foreground">No custom rules yet.</p>}
              {config.customRules.map((rule) => (
                <div key={rule.id} className="rounded-md border border-border p-3" data-testid={`rule-row-${rule.id}`}>
                  <div className="mb-3 flex items-center gap-2">
                    <Input value={rule.name} onChange={(e) => updateRule(rule.id, "name", e.target.value)} className="h-9 font-medium" placeholder="Rule name" />
                    <Button variant="ghost" size="icon" onClick={() => removeRule(rule.id)} data-testid={`remove-rule-${rule.id}`} className="shrink-0 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <MiniField label="Category"><SelectBox value={rule.category} onChange={(v) => updateRule(rule.id, "category", v)} options={[{ value: "any", label: "Any" }, ...config.categories.map((c) => ({ value: c.id, label: c.name }))]} /></MiniField>
                    <MiniField label="Route"><SelectBox value={rule.routeId} onChange={(v) => updateRule(rule.id, "routeId", v)} options={[{ value: "any", label: "Any" }, ...ROUTES.map((r) => ({ value: r.id, label: r.source }))]} /></MiniField>
                    <MiniField label="Type"><SelectBox value={rule.adjustType} onChange={(v) => updateRule(rule.id, "adjustType", v)} options={[{ value: "percent", label: "% of cost" }, { value: "flat", label: "Flat ZAR" }]} /></MiniField>
                    <MiniField label="Value"><Input type="number" value={rule.value} onChange={(e) => updateRule(rule.id, "value", e.target.value)} className="h-9 font-mono" /></MiniField>
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={addRule} testid="add-rule-btn">Add custom rule</AddButton>
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
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary"><Icon className="h-4 w-4" /></div>
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
      <Input data-testid={testid} type="number" min="0" step={step} className="font-mono" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : parseFloat(e.target.value))} />
    </div>
  );
}

function SelectBox({ value, onChange, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function AddButton({ onClick, children, testid }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} data-testid={testid} className="mt-4 rounded-full"><Plus className="h-4 w-4" /> {children}</Button>
  );
}
