import AppShell from "./components/AppShell";
import MobileAppShell from "./components/mobile/MobileAppShell";
import { PortraitGate } from "./components/PortraitGate";
import { FarmProvider } from "./context/FarmContext";
import { DashboardProjectionProvider } from "./context/DashboardProjectionContext";
import { MOBILE_BREAKPOINT_PX } from "./domain/config";
import { useOrientation } from "./hooks/useOrientation";
import { useViewportSize } from "./hooks/useViewportSize";

function App() {
  const { width } = useViewportSize();
  const orientation = useOrientation();
  const isMobile = width < MOBILE_BREAKPOINT_PX;

  let view = <AppShell />;
  if (isMobile) {
    view = orientation === "portrait" ? <PortraitGate /> : <MobileAppShell />;
  }

  return (
    <FarmProvider>
      <DashboardProjectionProvider>{view}</DashboardProjectionProvider>
    </FarmProvider>
  );
}

export default App;
