import { useEffect, useState } from "react";
import styles from "./Legend.module.css";
import { shouldHideInteractiveElementsForZoneSmoke } from "../domain/zoneSmokeTest";
import { ZonesArea } from "./panels/ZonesArea";

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;
const IS_URL_PATTERN = /^https?:\/\/[^\s]+$/;

function linkifyText(text: string) {
  return text.split(URL_PATTERN).map((part, index) =>
    IS_URL_PATTERN.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noreferrer noopener" className={styles.worklogLink}>
        {part}
      </a>
    ) : (
      part
    ),
  );
}

const WORKLOG_STEPS = [
  {
    title: "Осознаю задачу, формулирую вопросы, догадки и идеи на борде.",
    body:
      "Ничего не фильтрую на этом этапе. Вопросы вперемешку с полу идеями, что-то явно лишнее, что-то потом окажется важным. Порядок появится позже, сейчас важно вытащить все на поверхность. Вот сам борд, там можно посмотреть целиком весь этап брейншторма, проектирования и переписку с моделями https://excalidraw.com/#room=f72b1750d94fa24faab5,HAWB40wlGegwaCnJFi1Ogw",
  },
  {
    title: "Формулирую гипотезу на основе своих вопросов на борде",
    body:
      "Собираю связную версию того, как задача может решаться и выглядеть. Пока как вектор.",
  },
  {
    title:
      "Прожариваю предложенное решение: ищу дыры в логике, переусложнения, риски, сверяюсь с первоначальным заданием. В диалоге корректирую план действий и механику",
    body:
      "Специально становлюсь критиком собственной идеи. Ищу места, где решение усложнено без нужды, где я подменила требование своим видением, а о чем просто не подумала.",
  },
  {
    title: "Стартую каркас ТЗ по тем пунктам, которые понятны",
    body:
      "Фиксирую то, что уже не вызывает вопросов, и намеренно оставляю дыры там, где ясности нет. Буду прорабатывать в следующих этапах, может что-то нужно будет убрать.",
  },
  {
    title:
      "Продолжаю диалог по непонятным пунктам, ресерчу бест-практис механик антифрода, ищу что можно имплементировать.",
    body:
      "Вдохновляюсь паттернами решения подобных задач в интернете. Дыры из предыдущего шага в основном закрываются здесь, но мелочи могу и оставить.",
  },
  {
    title: "Генерю финальное изображение, чтобы UI не расходился с механикой",
    body:
      "Визуал в данном случае нужен и для вдохновения и для проверки: если картинка не собирается логично, значит, где-то в механике осталась дыра, которую в ТЗ легко упустить.",
  },
  {
    title: "Первую версию ТЗ отдаю модели-критику (gpt 5.4) на допрожарку и новые вопросы",
    body:
      "Свежий взгляд без моей привязанности к формулировкам. Задача модели цепляться к тому, что я уже перестала замечать, потому что смотрю на документ слишком давно.",
  },
  {
    title:
      "Документ ТЗ с критикой переношу в IDE, новой моделью поумнее (Opus 4.8) прорабатываем детали с помощью grill-me skill.",
    body:
      "Более предметная работа. Каждая слабая точка из критики разбирается отдельно, пока не останется мест, куда можно ткнуть пальцем и спросить \"а как это будет работать\".",
  },
  {
    title: "Проработка канваса, дашборда, фронтенд-деталей",
    body:
      "Не до конца продумываю, потому что на такого объема задаче проще будет отталкиваться от реальной механики, но главные детали закладываю сразу.",
  },
  {
    title: "Создаю репозиторий, старт с бойлерплейта.",
    body:
      "Стек, структура, собственные заготовки из своих проектов, проверенные скиллы и конфиги.",
  },
  {
    title: "Распределяю и закрепляю агентные роли, агент планировщик составляет роадмап",
    body:
      "Каждому агенту своя роль и зона ответственности, чтобы не решали одну и ту же задачу параллельно и проверяли друг друга. Планировщик собирает из всего этого дорожную карту, я все аппрувлю и корректирую.",
  },
  {
    title:
      "Сначала последовательно, а потом параллельно делаем задачи, управление не автономное, я фиксирую каждый PR в preprod",
    body:
      "Первые этапы веду по очереди, чтобы самой лучше разобраться в проекте + оттестировать фреймворк ролей и их качество с этим стеком и задачей. Агенты работают не автономно: каждый PR проходит через меня в preprod, прежде чем двигаться дальше. После Stage2 перераспределяю работу на параллельные треки, но продолжаю контролировать.",
  },
  {
    title: "После stage 6/7 ручное тестирование.",
    body:
      "На этом этапе все проверяю руками. Автотесты ловят логические ошибки и помогают не переделывать одно и то жде сто раз, но интерфейс надо сверять глазами.",
  },
  {
    title: "Готово, вы великолепны.",
    body:
      "Финальный тест, подчистка хвостов, проверка, что все работает, написание чудесного текста для AI Workflow и билд проекта 😎",
  },
] as const;

export function Legend() {
  const [worklogOpen, setWorklogOpen] = useState(false);
  const hideButton = shouldHideInteractiveElementsForZoneSmoke();

  useEffect(() => {
    if (!worklogOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setWorklogOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [worklogOpen]);

  return (
    <section className={styles.legend} aria-label="Правила мира">
      <div className={styles.rulesContainer}>
        <h2 className={styles.heading}>Правила фермы</h2>

        <div className={styles.columns}>
          <div>
            <h3>Как течёт время</h3>
            <p>
              Когда симуляция запущена (нажми "запустить"), часы тикают 1:1 реальному времени. Пауза
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
              <li>Кролики не покидают ферму, не плодятся и не умирают.</li>
              <li>Система даёт <strong>оценку-диапазон</strong> и уверенность, а не точный подсчёт.</li>
              <li>Данные существуют только в рамках одной сессии.</li>
              <li>Выпуск пса в огород блокирует все действия в огороде.</li>
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
        <div className={styles.worklogOverlay} role="dialog" aria-label="AI Worklog" aria-modal="true">
          <div className={styles.worklogContent}>
            <div className={styles.worklogHeader}>
              <div>
                <p className={styles.worklogKicker}>AI Worklog</p>
                <h2 className={styles.worklogTitle}>Последовательный лог работы</h2>
              </div>
              <button
                type="button"
                className={styles.worklogClose}
                aria-label="Закрыть AI Worklog"
                onClick={() => setWorklogOpen(false)}
              >
                ×
              </button>
            </div>

            <ol className={styles.worklogList}>
              {WORKLOG_STEPS.map((step, index) => (
                <li key={step.title} className={styles.worklogItem}>
                  <div className={styles.worklogStepNumber}>{index + 1}</div>
                  <div className={styles.worklogStepBody}>
                    <h3>{step.title}</h3>
                    <div className={`${styles.worklogSlot} ${step.body ? styles.worklogSlotFilled : styles.worklogSlotPlaceholder}`}>
                      {step.body ? (
                        <p className={styles.worklogText}>{linkifyText(step.body)}</p>
                      ) : (
                        <span>Место под текст</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
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
          <p><strong>k</strong> — насколько быстро копятся слабые сигналы. Больше k — нужно больше событий, чтобы система "поверила" в присутствие.</p>
          <p><strong>τ (тау)</strong> — порог одного сильного сигнала. Событие с credibility ≥ τ сразу даёт presence=1, без накопления.</p>
          <p><strong>Нижний порог приоритета</strong> — порог перевода в среднюю срочность.</p>
          <p><strong>Верхний порог приоритета</strong> — порог перевода в высокую срочность.</p>
          <p><strong>Окно одновременности</strong> — события в одной зоне ближе друг к другу, чем это окно (сек), считаются одним сигналом, не накапливаются отдельно.</p>

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
    </section>
  );
}

export function ZonesTile() {
  return (
    <div className={styles.zonesTile}>
      <h3 className={styles.zonesTileHeading}>Зоны</h3>
      <ZonesArea />
    </div>
  );
}
