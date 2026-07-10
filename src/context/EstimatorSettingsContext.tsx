import React, { createContext, useContext, useState } from 'react';
import { type EstimatorSettings, DEFAULT_ESTIMATOR_SETTINGS } from '../domain/contract';

export interface EstimatorSettingsContextType {
  settings: EstimatorSettings;
  updateSetting: <K extends keyof EstimatorSettings>(key: K, value: EstimatorSettings[K]) => void;
  setSettings: React.Dispatch<React.SetStateAction<EstimatorSettings>>;
}

export const EstimatorSettingsContext = createContext<EstimatorSettingsContextType | undefined>(undefined);

export function EstimatorSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<EstimatorSettings>(DEFAULT_ESTIMATOR_SETTINGS);

  const updateSetting = <K extends keyof EstimatorSettings>(key: K, value: EstimatorSettings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <EstimatorSettingsContext.Provider value={{ settings, updateSetting, setSettings }}>
      {children}
    </EstimatorSettingsContext.Provider>
  );
}

export function useEstimatorSettings() {
  const context = useContext(EstimatorSettingsContext);
  return context;
}
