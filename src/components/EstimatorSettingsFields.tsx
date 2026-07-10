import React from "react";
import styles from "./RecommendationsPanel.module.css";
import { useEstimatorSettings } from "../context/EstimatorSettingsContext";
import { DEFAULT_ESTIMATOR_SETTINGS } from "../domain/contract";
import { shouldHideInteractiveElementsForZoneSmoke } from "../domain/zoneSmokeTest";

function StepperButton({
  ariaLabel,
  onClick,
  children,
}: {
  ariaLabel: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  if (shouldHideInteractiveElementsForZoneSmoke()) {
    return (
      <span className={styles.stepperButton} aria-label={ariaLabel} onClick={onClick} role="presentation">
        {children}
      </span>
    );
  }

  return (
    <button type="button" className={styles.stepperButton} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  );
}

interface StepperFieldProps {
  label: string;
  ariaLabel: string;
  value: number;
  onChange: (value: number) => void;
  step: number;
  min: number;
  max: number;
  helperText?: string;
}

function StepperField({ label, ariaLabel, value, onChange, step, min, max, helperText }: StepperFieldProps) {
  const round = (n: number) => Math.round(n * 100) / 100;
  const inputId = `input-${ariaLabel.replace(/\s+/g, '-').toLowerCase()}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, round(parsed)));
      onChange(clamped);
    }
  };

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.fieldLabel}>
        {label}
      </label>
      <div className={styles.stepper}>
        <StepperButton ariaLabel="Уменьшить" onClick={() => onChange(Math.max(min, round(value - step)))}>
          −
        </StepperButton>
        <input
          id={inputId}
          type="number"
          min={min}
          max={max}
          step={step}
          aria-label={ariaLabel}
          value={value}
          onChange={handleInputChange}
          className={styles.stepperValue}
        />
        <StepperButton ariaLabel="Увеличить" onClick={() => onChange(Math.min(max, round(value + step)))}>
          +
        </StepperButton>
      </div>
      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}

export function EstimatorSettingsFields() {
  const context = useEstimatorSettings();
  const settings = context?.settings ?? DEFAULT_ESTIMATOR_SETTINGS;
  const updateSetting = context?.updateSetting ?? (() => {});

  return (
    <div className={styles.settingsShell}>
      <h3>Параметры estimator'а</h3>
      <div className={styles.settingsFields}>
        <StepperField
          label="k"
          ariaLabel="k"
          value={settings.k}
          onChange={(val) => updateSetting("k", val)}
          step={0.1}
          min={0}
          max={5}
          helperText="Коэффициент насыщения presence (скорость роста доверия)"
        />
        <StepperField
          label="τ"
          ariaLabel="τ"
          value={settings.tau}
          onChange={(val) => updateSetting("tau", val)}
          step={0.05}
          min={0}
          max={1}
          helperText="Порог правдоподобия для подтверждения кролика"
        />
        <StepperField
          label="Окно одновременности"
          ariaLabel="Concurrency window"
          value={settings.concurrencyWindowSeconds}
          onChange={(val) => updateSetting("concurrencyWindowSeconds", val)}
          step={1}
          min={0}
          max={60}
          helperText="Интервал времени в секундах для объединения сигналов"
        />
        <StepperField
          label="dogSuppression"
          ariaLabel="dogSuppression"
          value={settings.dogSuppression}
          onChange={(val) => updateSetting("dogSuppression", val)}
          step={0.05}
          min={0}
          max={1}
          helperText="Коэффициент подавления сигналов при собаке"
        />
        <StepperField
          label="Нижний порог приоритета"
          ariaLabel="priorityLowThreshold"
          value={settings.priorityLowThreshold}
          onChange={(val) => updateSetting("priorityLowThreshold", val)}
          step={1}
          min={0}
          max={10}
          helperText="Порог перевода в среднюю срочность"
        />
        <StepperField
          label="Верхний порог приоритета"
          ariaLabel="priorityHighThreshold"
          value={settings.priorityHighThreshold}
          onChange={(val) => updateSetting("priorityHighThreshold", val)}
          step={1}
          min={0}
          max={10}
          helperText="Порог перевода в высокую срочность"
        />
      </div>
      <div data-testid="dog-toggle-slot" className={styles.slot}>
        Слот под dog toggle
      </div>
    </div>
  );
}
