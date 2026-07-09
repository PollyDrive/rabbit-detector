import styles from "../AppShell.module.css";

export function ControlArea() {
  return (
    <div className={styles.controlContent}>
      <div>
        <h2>Симулятор</h2>
      </div>
      <div>
        <h3>Параметры estimator'а</h3>
      </div>
    </div>
  );
}
