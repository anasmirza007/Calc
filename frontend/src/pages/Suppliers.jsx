import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ROUTES, CURRENCIES } from "@/lib/defaults";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, ArrowRight } from "lucide-react";

const BLANK = { id: "", name: "", code: "", routeId: "india-sa", currency: "INR" };

export default function Suppliers({ onNavigate }) {
  const { suppliers, upsertSupplier, deleteSupplier, setDraft } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => { setForm({ ...BLANK }); setOpen(true); };
  const openEdit = (s) => { setForm({ ...s }); setOpen(true); };

  const save = () => {
    if (!form.name.trim()) { toast.error("Supplier name is required"); return; }
    const rec = { ...form, id: form.id || `sup-${Date.now()}` };
    upsertSupplier(rec);
    setOpen(false);
    toast.success("Supplier saved");
  };

  const applyToCalc = (s) => {
    setDraft((d) => ({ ...d, supplierId: s.id, supplierName: s.name, supplierCode: s.code || "", routeId: s.routeId || d.routeId, currency: s.currency || d.currency }));
    toast.success(`Loaded ${s.name}`);
    onNavigate?.("calculate");
  };

  const routeName = (id) => ROUTES.find((r) => r.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="overline text-primary">Directory</p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Suppliers</h2>
          <p className="mt-1 text-sm text-muted-foreground">Save suppliers once, reuse them in any calculation.</p>
        </div>
        <Button className="rounded-full" onClick={openNew} data-testid="add-supplier-btn"><Plus className="h-4 w-4" /> Add Supplier</Button>
      </div>

      {suppliers.length === 0 ? (
        <Card className="rounded-lg border-dashed p-10 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No suppliers saved yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s, i) => (
            <Card key={s.id} data-testid={`supplier-card-${i}`} className="flex flex-col justify-between rounded-lg border-border p-5 shadow-sm transition-transform hover:-translate-y-[1px] hover:shadow-md">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-lg font-semibold text-foreground">{s.name}</h3>
                  <Badge variant="outline" className="font-mono text-xs">{s.code || "—"}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-secondary px-2 py-0.5">{routeName(s.routeId)}</span>
                  <span className="rounded bg-secondary px-2 py-0.5">{s.currency}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <Button size="sm" className="rounded-full" onClick={() => applyToCalc(s)} data-testid={`use-supplier-${i}`}>Use <ArrowRight className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)} data-testid={`edit-supplier-${i}`}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { deleteSupplier(s.id); toast.success("Supplier deleted"); }} data-testid={`delete-supplier-${i}`}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id ? "Edit supplier" : "New supplier"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Supplier name</Label>
              <Input data-testid="supplier-name-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Mumbai Textiles" />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input data-testid="supplier-code-input" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="e.g. MT-01" />
            </div>
            <div className="space-y-2">
              <Label>Default currency</Label>
              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger data-testid="supplier-currency-select"><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Default route</Label>
              <Select value={form.routeId} onValueChange={(v) => set("routeId", v)}>
                <SelectTrigger data-testid="supplier-route-select"><SelectValue /></SelectTrigger>
                <SelectContent>{ROUTES.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} data-testid="save-supplier-btn">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
