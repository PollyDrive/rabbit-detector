import { useState } from "react";
import styles from "./EventLogTabs.module.css";
import { EventLog } from "../EventLog";
import { AuditLog } from "./AuditLog";
import { shouldHideInteractiveElementsForZoneSmoke } from "../../domain/zoneSmokeTest";

type Tab = "log" | "audit";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "log", label: "Лог событий" },
  { id: "audit", label: "Журнал аудита" },
];

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const className = [styles.tab, active ? styles.tabActive : ""].join(" ");

  if (shouldHideInteractiveElementsForZoneSmoke()) {
    return (
      <span role="presentation" aria-selected={active} className={className} onClick={onClick}>
        {children}
      </span>
    );
  }

  return (
    <button type="button" role="tab" aria-selected={active} className={className} onClick={onClick}>
      {children}
    </button>
  );
}

export function EventLogTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("log");

  return (
    <section aria-label="Журналы" className={styles.panel}>
      <div role="tablist" className={styles.tablist}>
        {TABS.map((tab) => (
          <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </TabButton>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === "log" ? <EventLog /> : <AuditLog />}
      </div>
    </section>
  );
}
