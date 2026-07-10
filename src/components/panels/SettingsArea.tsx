import styles from "./SettingsArea.module.css";
import { EstimatorSettingsFields } from "../EstimatorSettingsFields";

export function SettingsArea() {
  return (
    <section className={styles.area} aria-label="Настройка">
      <h2 className={styles.title}>Настройка</h2>
      <EstimatorSettingsFields />
    </section>
  );
}
