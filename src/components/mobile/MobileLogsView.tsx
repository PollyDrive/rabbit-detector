import styles from "./MobileLogsView.module.css";
import { EventLogTabs } from "../panels/EventLogTabs";

export function MobileLogsView() {
  return (
    <div className={styles.scroll} data-testid="mobile-logs-view">
      <EventLogTabs mobile />
    </div>
  );
}
