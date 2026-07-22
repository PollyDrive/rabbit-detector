import { useState } from "react";
import styles from "./MobileAppShell.module.css";
import { MobileSimBar } from "./MobileSimBar";
import { MobileTabBar, type MobileTab } from "./MobileTabBar";
import { MobileMapView } from "./MobileMapView";
import { MobileDashboardView } from "./MobileDashboardView";
import { MobileLogsView } from "./MobileLogsView";
import { MobileSettingsView } from "./MobileSettingsView";
import { HelpButton, OnboardingModal, hasSeenOnboarding, markOnboardingSeen } from "../OnboardingModal";

export default function MobileAppShell() {
  const [tab, setTab] = useState<MobileTab>("map");
  const [onboardingOpen, setOnboardingOpen] = useState(() => !hasSeenOnboarding());

  const closeOnboarding = () => {
    markOnboardingSeen();
    setOnboardingOpen(false);
  };

  return (
    <main className={styles.shell} data-testid="mobile-app-shell">
      <HelpButton onClick={() => setOnboardingOpen(true)} />
      {onboardingOpen && <OnboardingModal onClose={closeOnboarding} />}

      <div className={styles.body}>
        <MobileSimBar />

        <div className={styles.content}>
          {tab === "map" && <MobileMapView />}
          {tab === "dashboard" && <MobileDashboardView />}
          {tab === "logs" && <MobileLogsView />}
          {tab === "settings" && <MobileSettingsView />}
        </div>
      </div>

      <MobileTabBar active={tab} onChange={setTab} />
    </main>
  );
}
