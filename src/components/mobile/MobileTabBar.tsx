import styles from "./MobileTabBar.module.css";

export type MobileTab = "map" | "dashboard" | "logs" | "settings";

const TABS: Array<{ id: MobileTab; label: string; icon: string }> = [
  { id: "map", label: "Карта", icon: "🗺️" },
  { id: "dashboard", label: "Дашборд", icon: "📊" },
  { id: "logs", label: "Логи", icon: "📜" },
  { id: "settings", label: "Настройки", icon: "⚙️" },
];

export function MobileTabBar({ active, onChange }: { active: MobileTab; onChange: (tab: MobileTab) => void }) {
  return (
    <nav className={styles.bar} data-testid="mobile-tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={[styles.tab, tab.id === active ? styles.tabActive : ""].join(" ")}
          onClick={() => onChange(tab.id)}
          aria-current={tab.id === active}
          data-testid={`mobile-tab-${tab.id}`}
        >
          <span className={styles.icon} aria-hidden="true">
            {tab.icon}
          </span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
