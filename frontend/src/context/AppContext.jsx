import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  loadConfig,
  saveConfig,
  resetConfig,
  loadHistory,
  saveHistory,
  loadSuppliers,
  saveSuppliers,
  loadProducts,
  saveProducts,
} from "@/lib/storage";

const AppContext = createContext(null);

export const EMPTY_DRAFT = {
  supplierId: "",
  supplierName: "",
  supplierCode: "",
  productId: "",
  productName: "",
  category: "",
  subCategory: "",
  routeId: "india-sa",
  shippingMethod: "Ship",
  currency: "INR",
  priceBasis: "per_meter",
  buyingPrice: "",
  quantity: "1",
  qtyUnit: "roll",
  metersInRoll: "",
  weight: "",
  dutyEnabled: true,
  shippingTime: "",
};

export function AppProvider({ children }) {
  const [config, setConfig] = useState(() => loadConfig());
  const [history, setHistory] = useState(() => loadHistory());
  const [suppliers, setSuppliers] = useState(() => loadSuppliers());
  const [products, setProducts] = useState(() => loadProducts());
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  useEffect(() => { saveConfig(config); }, [config]);
  useEffect(() => { saveHistory(history); }, [history]);
  useEffect(() => { saveSuppliers(suppliers); }, [suppliers]);
  useEffect(() => { saveProducts(products); }, [products]);

  const updateConfig = (updater) =>
    setConfig((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      return { ...next };
    });

  const resetToDefaults = () => setConfig(resetConfig());

  const addCalculation = (record) => setHistory((prev) => [record, ...prev].slice(0, 200));
  const deleteCalculation = (id) => setHistory((prev) => prev.filter((r) => r.id !== id));
  const clearHistory = () => setHistory([]);

  // Suppliers CRUD
  const upsertSupplier = (s) =>
    setSuppliers((prev) => {
      const exists = prev.some((x) => x.id === s.id);
      return exists ? prev.map((x) => (x.id === s.id ? s : x)) : [{ ...s }, ...prev];
    });
  const deleteSupplier = (id) => setSuppliers((prev) => prev.filter((x) => x.id !== id));

  // Products CRUD
  const upsertProduct = (p) =>
    setProducts((prev) => {
      const exists = prev.some((x) => x.id === p.id);
      return exists ? prev.map((x) => (x.id === p.id ? p : x)) : [{ ...p }, ...prev];
    });
  const deleteProduct = (id) => setProducts((prev) => prev.filter((x) => x.id !== id));

  const value = useMemo(
    () => ({
      config, setConfig, updateConfig, resetToDefaults,
      history, addCalculation, deleteCalculation, clearHistory,
      suppliers, upsertSupplier, deleteSupplier,
      products, upsertProduct, deleteProduct,
      draft, setDraft,
    }),
    [config, history, suppliers, products, draft]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
