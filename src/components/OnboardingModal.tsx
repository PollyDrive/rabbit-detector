import { useEffect, type ReactNode } from "react";
import styles from "./OnboardingModal.module.css";
import { shouldHideInteractiveElementsForZoneSmoke } from "../domain/zoneSmokeTest";

function ModalButton({
  className,
  ariaLabel,
  onClick,
  children,
}: {
  className: string;
  ariaLabel?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  if (shouldHideInteractiveElementsForZoneSmoke()) {
    return (
      <span className={className} aria-label={ariaLabel} onClick={onClick} role="presentation">
        {children}
      </span>
    );
  }

  return (
    <button type="button" className={className} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  );
}

export const ONBOARDING_STORAGE_KEY = "rabbit-farm-onboarding-seen-v1";

// localStorage can be unavailable (SSR, some test environments, privacy
// modes) — treat that as "not seen yet" / "can't persist" rather than throw.
// Acceptance tests mount <App/> fresh each time and assert on copy that
// overlaps the modal's own text (e.g. "игровое время") — auto-opening there
// would make queries ambiguous, so tests always start past onboarding.
export function hasSeenOnboarding(): boolean {
  if (import.meta.env.MODE === "test") {
    return true;
  }

  try {
    return typeof window !== "undefined" && Boolean(window.localStorage?.getItem(ONBOARDING_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function markOnboardingSeen(): void {
  try {
    window.localStorage?.setItem(ONBOARDING_STORAGE_KEY, "1");
  } catch {
    // ignore — nothing to persist to
  }
}

export function OnboardingModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-label="Как устроена ферма" aria-modal="true">
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>Быстрый гайд</p>
            <h2 className={styles.title}>Как устроена эта ферма</h2>
          </div>
          <ModalButton className={styles.close} ariaLabel="Закрыть гайд" onClick={onClose}>
            ×
          </ModalButton>
        </div>

        <div className={styles.body}>
          <p>
            На ферме прячутся кролики. Напрямую их не видно, только косвенные сигналы: следы,
            ямы, шуршание, пропажа морковки, датчик движения. Система по ним оценивает{" "}
            <strong>диапазон количества кроликов</strong> и подсвечивает зоны с самым сильным
            сигналом, а не считает их поштучно.
          </p>

          <h3>Где что нажимать</h3>
          <ul>
            <li>
              <strong>«Запустить» / «Остановить».</strong> Блок «Симулятор фермы» слева вверху. Включает и
              останавливает игровое время, оно идёт 1:1 с реальным.
            </li>
            <li>
              <strong>Карта в центре.</strong> Клик по зоне (огород, теплица, сарай, забор)
              открывает форму добавления события: тип сигнала и интенсивность 1–10. Работает,
              когда симулятор на паузе.
            </li>
            <li>
              <strong>«Промотать час».</strong> Там же. Мгновенно двигает время на час вперёд,
              старые события выпадают из окна.
            </li>
            <li>
              <strong>«Пересоздать историю».</strong> Там же. Генерирует новый набор случайных
              событий с нуля.
            </li>
            <li>
              <strong>Переключатель «Пёс».</strong> Под блоком «Симулятор фермы». Выпускает пса в
              огород, там всё блокируется.
            </li>
            <li>
              <strong>Ползунки «Параметры сигналов».</strong> Там же ниже. k, t и пороги
              приоритета настраивают, насколько быстро система «верит» в присутствие кролика.
            </li>
            <li>
              <strong>«Дашборд фермера».</strong> Справа. Диапазон кроликов и % уверенности,
              считается в реальном времени по твоим событиям.
            </li>
          </ul>

          <p>
            Полные правила мира и формулы уверенности живут в блоке{" "}
            <strong>«Правила фермы»</strong> внизу страницы.
          </p>
        </div>

        <ModalButton className={styles.cta} onClick={onClose}>
          Погнали!
        </ModalButton>
      </div>
    </div>
  );
}

export function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <ModalButton className={styles.helpButton} ariaLabel="Открыть гайд по ферме" onClick={onClick}>
      ?
    </ModalButton>
  );
}
