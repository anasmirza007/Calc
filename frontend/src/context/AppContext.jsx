import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadConfig, saveConfig, resetConfig, loadHistory, saveHistory } from "@/lib/storage";

const AppContext = createContext(null);

export const EMPTY_DRAFT = {
  supplierName: "",
  supplierCode: "",
  category: "",
  routeId: "india-sa",
  shippingMethod: "Ship",
  pricePerMeter: "",
  metersInRoll: "",
  weight: "",
  shippingTime: "",
};

export function AppProvider({ children }) {
  const [config, setConfig] = useState(() => loadConfig());
  const [history, setHistory] = useState(() => loadHistory());
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const updateConfig = (updater) => {
    setConfig((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      return { ...next };
    });
  };

  const resetToDefaults = () => setConfig(resetConfig());

  const addCalculation = (record) => {
    setHistory((prev) => [record, ...prev].slice(0, 200));
  };

  const deleteCalculation = (id) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
  };

  const clearHistory = () => setHistory([]);

  const value = useMemo(
    () => ({
      config,
      setConfig,
      updateConfig,
      resetToDefaults,
      history,
      addCalculation,
      deleteCalculation,
      clearHistory,
      draft,
      setDraft,
    }),
    [config, history, draft]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
