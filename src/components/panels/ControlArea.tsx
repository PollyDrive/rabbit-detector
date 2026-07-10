import styles from "../AppShell.module.css";
import { formatGameTime } from "../../domain/runtime";
import { useFarm } from "../../context/FarmContext";
import { shouldHideInteractiveElementsForZoneSmoke } from "../../domain/zoneSmokeTest";
import { EstimatorSettingsFields } from "../EstimatorSettingsFields";

function ControlAction({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  const hideButtons = shouldHideInteractiveElementsForZoneSmoke();

  if (hideButtons) {
    return (
      <span
        className={styles.controlTextAction}
        onClick={onClick}
        role="presentation"
      >
        {children}
      </span>
    );
  }

  return (
    <button type="button" onClick={onClick}>
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
  const runningLabel = state.running ? "Пауза" : "Запустить";

  return (
    <div className={styles.controlContent}>
      <div>
        <h2>Симулятор</h2>
        <p className={styles.clock}>Игровое время: {formatGameTime(state.gameTime)}</p>
        <div className={styles.buttonRow}>
          <ControlAction onClick={() => setRunning(!state.running)}>
            {runningLabel}
          </ControlAction>
          <ControlAction onClick={fastForward}>
            Промотать час
          </ControlAction>
          <ControlAction onClick={regenerateHistory}>
            Пересоздать историю
          </ControlAction>
        </div>
      </div>
      <div>
        <h3>Пёс</h3>
        <DogToggle checked={state.dogInGarden} onToggle={toggleDog} />
      </div>
      <EstimatorSettingsFields />
    </div>
  );
}
