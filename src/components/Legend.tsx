import { useEffect, useRef, useState } from "react";
import styles from "./Legend.module.css";
import { shouldHideInteractiveElementsForZoneSmoke } from "../domain/zoneSmokeTest";
import { ZonesArea } from "./panels/ZonesArea";

function RulesContent() {
  return (
    <div className={styles.rulesContainer}>
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
            <li>В огороде нет датчиков — только отпечатки лап, пропажа моркови, новые ямы.</li>
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
      </div>
    </div>
  );
}

export function LegendOverlay() {
  const [open, setOpen] = useState(false);
  const hideButton = shouldHideInteractiveElementsForZoneSmoke();
  const triggerRef = useRef<HTMLButtonElement | HTMLSpanElement>(null);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {hideButton ? (
        <span
          ref={triggerRef as React.RefObject<HTMLSpanElement>}
          role="presentation"
          className={styles.legendTrigger}
          onClick={() => setOpen(true)}
        >
          Legend
        </span>
      ) : (
        <button
          ref={triggerRef as React.RefObject<HTMLButtonElement>}
          type="button"
          className={styles.legendTrigger}
          onClick={() => setOpen(true)}
        >
          Legend
        </button>
      )}

      {open && (
        <div className={styles.legendOverlayBackdrop} role="dialog" aria-label="Правила мира" aria-modal="true">
          <div className={styles.legendDialog}>
            <div className={styles.legendDialogHeader}>
              <button type="button" className={styles.legendClose} onClick={close}>
                Закрыть
              </button>
            </div>
            <RulesContent />
          </div>
        </div>
      )}
    </>
  );
}

const WORKLOG_SUMMARY = [
  { label: "Role", value: "Human orchestrator" },
  { label: "AI setup", value: "3 agent environments" },
  { label: "Primary method", value: "Spec-first decomposition" },
];

const WORKLOG_ENTRIES = [
  {
    phase: "01",
    title: "Product framing from the spec",
    role: "AI-assisted analysis",
    summary:
      "Started from the test assignment itself, not from UI guesswork: extracted the event-sourcing model, domain constants, projection rules, and edge cases into a structured design map.",
    ai:
      "Used AI to unpack the brief, normalize terminology, surface contradictions early, and turn the raw spec into a navigable reasoning schema.",
    human:
      "Logged the design decisions in detail, checked them against the original wording, and kept the schema as the source of truth for later implementation rounds.",
    output: "Structured architecture schema with domain rules, constraints, and open questions.",
  },
  {
    phase: "02",
    title: "Scope cutting and acceptance planning",
    role: "Human-led orchestration",
    summary:
      "Split the work into implementation-sized scopes so each step had a clean target and a matching proof of completion.",
    ai:
      "Used AI to draft issue boundaries, propose acceptance-test angles, and pressure-test whether each task could pass independently.",
    human:
      "Filtered the suggestions, rewrote ambiguous scopes, and enforced that every acceptance test matched the exact level of the issue instead of quietly depending on neighboring work.",
    output: "Work breakdown aligned to branches, stages, and acceptance criteria.",
  },
  {
    phase: "03",
    title: "Parallel implementation across three agent setups",
    role: "Manual multi-agent conductor",
    summary:
      "After the design phase, development shifted into a manual orchestration model: multiple agent environments worked in parallel, but the flow stayed centrally directed.",
    ai:
      "Different models handled coding, review, and focused debugging passes in separate environments to accelerate iteration and reduce tunnel vision.",
    human:
      "Assigned scope, selected which environment should handle which problem, moved context between them, and prevented drift across branches, tests, and product intent.",
    output: "Parallelized delivery without giving up architectural consistency.",
  },
  {
    phase: "04",
    title: "Review, contradiction handling, and resets",
    role: "Quality gatekeeping",
    summary:
      "AI output was treated as draft engineering work, not as ground truth. Every non-trivial change went through review for regressions, false assumptions, and scope leakage.",
    ai:
      "Used AI for code review passes, alternative implementations, and bug-hunting when a test, branch, or behavior looked inconsistent.",
    human:
      "Rejected weak proposals, reset incorrect directions, reconciled conflicts between agent outputs, and kept the implementation tied to the actual product logic instead of persuasive text.",
    output: "A tighter feedback loop where AI accelerated work but did not self-approve it.",
  },
  {
    phase: "05",
    title: "Integration, verification, and narrative packaging",
    role: "Delivery synthesis",
    summary:
      "The final stage combined code, tests, deploy prep, and explanation into a presentable artifact that shows both the product and the process behind it.",
    ai:
      "Used AI to help draft technical explanations, deployment scaffolding, and this worklog narrative layer that makes the process inspectable from the outside.",
    human:
      "Curated the final story, decided what evidence mattered, and connected the detailed prompt/schema history with a clean sequential log suitable for reviewers.",
    output: "Working project plus an auditable AI usage trail.",
  },
] as const;

export function AiWorklogTrigger() {
  const [worklogOpen, setWorklogOpen] = useState(false);
  const hideButton = shouldHideInteractiveElementsForZoneSmoke();

  return (
    <section className={styles.legend}>
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
            <div className={styles.worklogHeader}>
              <div>
                <p className={styles.worklogEyebrow}>AI Worklog</p>
                <h2 className={styles.worklogTitle}>How AI was actually used in this project</h2>
                <p className={styles.worklogIntro}>
                  The design phase was logged in detail as a separate schema. After that, the project moved
                  into a human-orchestrated multi-agent workflow: AI handled analysis, coding, review, and
                  debugging passes, while scope, arbitration, and final quality control stayed manual.
                </p>
              </div>

              <button type="button" className={styles.worklogClose} onClick={() => setWorklogOpen(false)}>
                Close
              </button>
            </div>

            <div className={styles.worklogSummary}>
              {WORKLOG_SUMMARY.map((item) => (
                <article key={item.label} className={styles.summaryCard}>
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>

            <ol className={styles.timeline}>
              {WORKLOG_ENTRIES.map((entry) => (
                <li key={entry.phase} className={styles.timelineItem}>
                  <div className={styles.timelineMarker} aria-hidden="true">
                    {entry.phase}
                  </div>

                  <article className={styles.timelineCard}>
                    <div className={styles.timelineHeading}>
                      <div>
                        <p>{entry.role}</p>
                        <h3>{entry.title}</h3>
                      </div>
                    </div>

                    <p className={styles.timelineSummary}>{entry.summary}</p>

                    <dl className={styles.timelineGrid}>
                      <div>
                        <dt>AI contribution</dt>
                        <dd>{entry.ai}</dd>
                      </div>
                      <div>
                        <dt>Human orchestration</dt>
                        <dd>{entry.human}</dd>
                      </div>
                      <div className={styles.timelineOutput}>
                        <dt>Deliverable</dt>
                        <dd>{entry.output}</dd>
                      </div>
                    </dl>
                  </article>
                </li>
              ))}
            </ol>

            <div className={styles.worklogFooter}>
              <p>
                The full prompt-level design trace and schema history are attached separately. This page is the
                sequential execution log: what AI did, what I kept manual, and how the workflow was controlled.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function ConfidenceSection() {
  return (
    <section className={styles.legend}>
      <div className={styles.confidenceContainer}>
        <div>
          <h3>Настройки</h3>
          <p>
            Ползунками порога приоритета вы настраиваете "термометр" всей фермы: при каком градусе общей шкалы (от 1 до 10) система должна считать ситуацию нормой, а при каком — начинать паниковать.
          </p>
          
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

        <div>
          <h3>Зоны</h3>
          <ZonesArea />
        </div>
      </div>
    </section>
  );
}
