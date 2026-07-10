import { useState } from "react";
import styles from "./Legend.module.css";
import { shouldHideInteractiveElementsForZoneSmoke } from "../domain/zoneSmokeTest";

export function Legend() {
  const [worklogOpen, setWorklogOpen] = useState(false);
  const hideButton = shouldHideInteractiveElementsForZoneSmoke();

  return (
    <section className={styles.legend} aria-label="Правила мира">
      <h2 className={styles.heading}>Правила фермы</h2>

      <div className={styles.columns}>
        <div>
          <h3>Как течёт время</h3>
          <p>
            Часы тикают 1:1 реальному времени, пока симулятор запущен. Пауза
            замораживает часы. «Промотать час» мгновенно двигает время
            вперёд — старые события выпадают из часового окна.
          </p>
        </div>

        <div>
          <h3>Как добавить событие</h3>
          <p>
            Остановите симулятор, кликните по зоне на карте, выберите тип
            события и интенсивность (1–10), нажмите «Добавить». Локация уже
            заполнена кликом.
          </p>
        </div>

        <div>
          <h3>Допущения мира</h3>
          <ul className={styles.assumptionList}>
            <li>В огороде нет датчиков — только следы, пропажа моркови, новые ямы.</li>
            <li>В сарае не бывает следов и новых ям — только датчик, шуршание, пропажа моркови.</li>
            <li>На заборе никогда не пропадает морковка.</li>
            <li>В теплице возможны любые сигналы — датчик стоит внутри.</li>
          </ul>
        </div>

        <div>
          <h3>Сигналы и их достоверность</h3>
          <ul className={styles.signalList}>
            <li><strong>Следы</strong> — 1.0, самый надёжный сигнал</li>
            <li><strong>Пропажа моркови</strong> — 0.8</li>
            <li><strong>Новая яма</strong> — 0.6</li>
            <li><strong>Шуршание</strong> — 0.4</li>
            <li><strong>Датчик движения</strong> — 0.2, самый слабый</li>
          </ul>
        </div>

        <div>
          <h3>На чём строится уверенность модели</h3>
          <ul className={styles.assumptionList}>
            <li><strong>Достоверность события</strong> = вес типа сигнала × (интенсивность / 10).</li>
            <li>
              Если достоверность хотя бы одного события в зоне за последний час ≥ τ — presence зоны
              сразу становится 1 (сильный сигнал перевешивает).
            </li>
            <li>
              Иначе presence растёт с числом слабых сигналов: среднее по достоверности × (1 − e^(−n / k)),
              где n — число событий в зоне.
            </li>
            <li><strong>Кроликов (диапазон)</strong> — низ: максимум одновременно занятых зон за час (кролик не телепортируется — сигналы из K разных зон одновременно ⇒ минимум K кроликов); верх: все зоны с любой активностью за час.</li>
            <li><strong>Уверенность, %</strong> — отношение нижней границы к верхней (чем уже диапазон, тем выше уверенность).</li>
          </ul>
        </div>
      </div>

      {hideButton ? (
        <span className={styles.worklogButton} role="presentation" onClick={() => setWorklogOpen(true)}>
          AI Worklog
        </span>
      ) : (
        <button type="button" className={styles.worklogButton} onClick={() => setWorklogOpen(true)}>
          AI Worklog
        </button>
      )}

      {worklogOpen && (
        <div className={styles.worklogOverlay} role="dialog" aria-label="AI Worklog">
          <div className={styles.worklogContent}>
            <h2>AI Worklog</h2>
            <p>Журнал разработки проекта появится здесь.</p>
            <button type="button" className={styles.worklogButton} onClick={() => setWorklogOpen(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
