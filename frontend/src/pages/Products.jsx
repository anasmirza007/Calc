import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { CURRENCIES, PRICE_BASIS } from "@/lib/defaults";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Boxes, ArrowRight } from "lucide-react";

const BLANK = { id: "", name: "", category: "", subCategory: "", currency: "INR", priceBasis: "per_meter", price: "", metersInRoll: "" };

export default function Products({ onNavigate }) {
  const { products, upsertProduct, deleteProduct, config, setDraft } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const activeCat = config.categories.find((c) => c.id === form.category);
  const subCats = activeCat?.subCategories || [];

  const openNew = () => { setForm({ ...BLANK }); setOpen(true); };
  const openEdit = (p) => { setForm({ ...p, price: p.price ?? "", metersInRoll: p.metersInRoll ?? "" }); setOpen(true); };

  const save = () => {
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (!form.category) { toast.error("Category is required"); return; }
    const rec = {
      ...form, id: form.id || `prod-${Date.now()}`,
      price: form.price === "" ? "" : parseFloat(form.price),
      metersInRoll: form.metersInRoll === "" ? "" : parseFloat(form.metersInRoll),
    };
    upsertProduct(rec);
    setOpen(false);
    toast.success("Product saved");
  };

  const applyToCalc = (p) => {
    setDraft((d) => ({
      ...d, productId: p.id, productName: p.name, category: p.category || "", subCategory: p.subCategory || "",
      currency: p.currency || d.currency, priceBasis: p.priceBasis || d.priceBasis,
      buyingPrice: p.price ?? d.buyingPrice, metersInRoll: p.metersInRoll ?? d.metersInRoll,
    }));
    toast.success(`Loaded ${p.name}`);
    onNavigate?.("calculate");
  };

  const catName = (id) => config.categories.find((c) => c.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="overline text-primary">Directory</p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">Save product presets to speed up pricing.</p>
        </div>
        <Button className="rounded-full" onClick={openNew} data-testid="add-product-btn"><Plus className="h-4 w-4" /> Add Product</Button>
      </div>

      {products.length === 0 ? (
        <Card className="rounded-lg border-dashed p-10 text-center">
          <Boxes className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No products saved yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Card key={p.id} data-testid={`product-card-${i}`} className="flex flex-col justify-between rounded-lg border-border p-5 shadow-sm transition-transform hover:-translate-y-[1px] hover:shadow-md">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-lg font-semibold text-foreground">{p.name}</h3>
                  <Badge variant="secondary" className="text-xs">{catName(p.category)}</Badge>
                </div>
                {p.subCategory && <p className="mt-1 text-xs text-muted-foreground">{p.subCategory}</p>}
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono">{p.currency} {p.price ?? "—"} / {p.priceBasis === "per_roll" ? "roll" : "m"}</span>
                  {p.metersInRoll ? <span className="rounded bg-secondary px-2 py-0.5">{p.metersInRoll} m/roll</span> : null}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <Button size="sm" className="rounded-full" onClick={() => applyToCalc(p)} data-testid={`use-product-${i}`}>Use <ArrowRight className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(p)} data-testid={`edit-product-${i}`}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { deleteProduct(p.id); toast.success("Product deleted"); }} data-testid={`delete-product-${i}`}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Product name</Label>
              <Input data-testid="product-name-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Cotton Lace 5cm" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category || undefined} onValueChange={(v) => set("category", v)}>
                <SelectTrigger data-testid="product-category-select"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{config.categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sub-category</Label>
              {subCats.length > 0 ? (
                <Select value={form.subCategory || undefined} onValueChange={(v) => set("subCategory", v)}>
                  <SelectTrigger data-testid="product-subcategory-select"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{subCats.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <Input data-testid="product-subcategory-input" value={form.subCategory} onChange={(e) => set("subCategory", e.target.value)} placeholder="Optional" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger data-testid="product-currency-select"><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price basis</Label>
              <Select value={form.priceBasis} onValueChange={(v) => set("priceBasis", v)}>
                <SelectTrigger data-testid="product-basis-select"><SelectValue /></SelectTrigger>
                <SelectContent>{PRICE_BASIS.map((pb) => <SelectItem key={pb.id} value={pb.id}>{pb.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price ({form.currency})</Label>
              <Input data-testid="product-price-input" type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Meters / roll</Label>
              <Input data-testid="product-meters-input" type="number" min="0" step="0.01" value={form.metersInRoll} onChange={(e) => set("metersInRoll", e.target.value)} placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} data-testid="save-product-btn">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
