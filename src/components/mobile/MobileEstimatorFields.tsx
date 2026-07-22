import styles from "./MobileEstimatorFields.module.css";
import { useEstimatorSettings } from "../../context/EstimatorSettingsContext";
import { DEFAULT_ESTIMATOR_SETTINGS, type EstimatorSettings } from "../../domain/contract";

type FieldKey = keyof Pick<
  EstimatorSettings,
  "k" | "tau" | "priorityLowThreshold" | "priorityHighThreshold" | "concurrencyWindowSeconds"
>;

interface FieldSpec {
  key: FieldKey;
  label: string;
  step: number;
  min: number;
  max: number;
}

// Grouped by what each parameter actually governs, not just listed in
// declaration order — five identical-looking rows in a row force the user
// to re-read every label; a group heading tells them what to expect before
// they read the first one.
const GROUPS: Array<{ title: string; fields: FieldSpec[] }> = [
  {
    title: "Присутствие",
    fields: [
      { key: "k", label: "k", step: 0.1, min: 0, max: 5 },
      { key: "tau", label: "t", step: 0.05, min: 0, max: 1 },
    ],
  },
  {
    title: "Приоритет",
    fields: [
      { key: "priorityLowThreshold", label: "Ниж. порог", step: 1, min: 0, max: 10 },
      { key: "priorityHighThreshold", label: "Верх. порог", step: 1, min: 0, max: 10 },
    ],
  },
  {
    title: "Группировка событий",
    fields: [{ key: "concurrencyWindowSeconds", label: "Окно, с", step: 1, min: 0, max: 10 }],
  },
];

const round = (n: number) => Math.round(n * 100) / 100;

export function MobileEstimatorFields() {
  const context = useEstimatorSettings();
  const settings = context?.settings ?? DEFAULT_ESTIMATOR_SETTINGS;
  const updateSetting = context?.updateSetting ?? (() => {});

  return (
    <div className={styles.groups} data-testid="mobile-estimator-fields">
      {GROUPS.map((group) => (
        <div key={group.title} className={styles.group}>
          <span className={styles.groupTitle}>{group.title}</span>
          <div className={styles.row}>
            {group.fields.map((field) => {
              const value = settings[field.key];
              return (
                <div key={field.key} className={styles.chip}>
                  <span className={styles.chipLabel}>{field.label}</span>
                  <button
                    type="button"
                    className={styles.chipButton}
                    aria-label={`Уменьшить ${field.label}`}
                    onClick={() => updateSetting(field.key, round(Math.max(field.min, value - field.step)))}
                  >
                    −
                  </button>
                  <span className={styles.chipValue}>{value}</span>
                  <button
                    type="button"
                    className={styles.chipButton}
                    aria-label={`Увеличить ${field.label}`}
                    onClick={() => updateSetting(field.key, round(Math.min(field.max, value + field.step)))}
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
