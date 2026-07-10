import { useState } from "react";
import styles from "./RecommendationsPanel.module.css";
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
  defaultValue: number;
  step: number;
  min: number;
  max: number;
}

function StepperField({ label, ariaLabel, defaultValue, step, min, max }: StepperFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const round = (n: number) => Math.round(n * 100) / 100;

  // Deliberately not a <label> wrapping all three controls: testing-library's
  // getByLabelText treats every descendant of a wrapping <label> as
  // "labelled by" its text, regardless of the descendant's own aria-label —
  // that turned the buttons into extra matches for the field's own
  // getByLabelText(/k\b/i)-style query. A plain heading + explicit
  // aria-label on just the input avoids that.
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.stepper}>
        <StepperButton ariaLabel="Уменьшить" onClick={() => setValue((v) => Math.max(min, round(v - step)))}>
          −
        </StepperButton>
        <input aria-label={ariaLabel} value={value} readOnly className={styles.stepperValue} />
        <StepperButton ariaLabel="Увеличить" onClick={() => setValue((v) => Math.min(max, round(v + step)))}>
          +
        </StepperButton>
      </div>
    </div>
  );
}

export function EstimatorSettingsFields() {
  return (
    <div className={styles.settingsShell}>
      <h3>Параметры estimator'а</h3>
      <div className={styles.settingsFields}>
        <StepperField label="k" ariaLabel="k" defaultValue={DEFAULT_ESTIMATOR_SETTINGS.k} step={0.1} min={0} max={5} />
        <StepperField label="τ" ariaLabel="τ" defaultValue={DEFAULT_ESTIMATOR_SETTINGS.tau} step={0.05} min={0} max={1} />
        <StepperField
          label="Окно одновременности"
          ariaLabel="Concurrency window"
          defaultValue={DEFAULT_ESTIMATOR_SETTINGS.concurrencyWindowSeconds}
          step={1}
          min={0}
          max={60}
        />
        <StepperField
          label="dogSuppression"
          ariaLabel="dogSuppression"
          defaultValue={DEFAULT_ESTIMATOR_SETTINGS.dogSuppression}
          step={0.05}
          min={0}
          max={1}
        />
      </div>
      <div data-testid="dog-toggle-slot" className={styles.slot}>
        Слот под dog toggle
      </div>
    </div>
  );
}
