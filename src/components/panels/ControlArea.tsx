import styles from "../AppShell.module.css";
import { formatGameTime } from "../../domain/runtime";
import { useFarm } from "../../context/FarmContext";
import { shouldHideInteractiveElementsForZoneSmoke } from "../../domain/zoneSmokeTest";
import { EstimatorSettingsFields } from "../EstimatorSettingsFields";

function ControlAction({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const hideButtons = shouldHideInteractiveElementsForZoneSmoke();
  const variantClass = {
    primary: styles.actionPrimary,
    secondary: styles.actionSecondary,
    danger: styles.actionDanger,
  }[variant];

  if (hideButtons) {
    return (
      <span
        className={styles.controlTextAction}
        onClick={disabled ? undefined : onClick}
        role="presentation"
        style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : undefined }}
      >
        {children}
      </span>
    );
  }

  return (
    <button type="button" className={variantClass} onClick={onClick} disabled={disabled} style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {children}
    </button>
  );
}

function DogToggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  const hideButtons = shouldHideInteractiveElementsForZoneSmoke();
  const switchClassName = [styles.switch, checked ? styles.switchOn : ""].join(" ");

  return (
    <label className={styles.switchRow}>
      {hideButtons ? (
        <span
          role="switch"
          aria-checked={checked}
          aria-label="Пёс в огороде"
          onClick={onToggle}
          className={switchClassName}
        >
          <span className={styles.switchKnob} />
        </span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label="Пёс в огороде"
          onClick={onToggle}
          className={switchClassName}
        >
          <span className={styles.switchKnob} />
        </button>
      )}
      <span>{checked ? "Пёс в огороде" : "Пёс на ферме"}</span>
    </label>
  );
}

export function ControlArea() {
  const { state, fastForward, regenerateHistory, setRunning, toggleDog } = useFarm();
  const runningLabel = state.running ? "Остановить" : "Запустить";
  const limitReached = state.gameTime >= 24 * 3600;

  return (
    <div className={styles.controlContent}>
      <div>
        <h2>Симулятор фермы</h2>
        <p className={styles.clock}>Игровое время: {formatGameTime(state.gameTime)}</p>
        <div className={styles.buttonRow}>
          <ControlAction variant="primary" onClick={() => setRunning(!state.running)}>
            {runningLabel}
          </ControlAction>
          <ControlAction variant="secondary" onClick={fastForward} disabled={limitReached}>
            {limitReached ? "Доступна перемотка только на сутки" : "Промотать на час вперёд"}
          </ControlAction>
          <ControlAction variant="danger" onClick={regenerateHistory}>
            Пересоздать историю
          </ControlAction>
        </div>
      </div>
      <div>
        <DogToggle checked={state.dogInGarden} onToggle={toggleDog} />
      </div>
      <EstimatorSettingsFields />
    </div>
  );
}
