import { useEffect, useState } from 'react';
import AppShell from "./components/AppShell";
import { MobileNotice } from "./components/MobileNotice";
import { FarmProvider } from "./context/FarmContext";
import { MOBILE_BREAKPOINT_PX } from "./domain/config";
import { MockedProjectionContext } from "./testing/contractTestHelpers";
import { useDashboardProjection } from "./hooks/useDashboardProjection";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT_PX,
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

function ProjectionWiring({ children }: { children: React.ReactNode }) {
  const projection = useDashboardProjection();
  return (
    <MockedProjectionContext.Provider value={projection}>
      {children}
    </MockedProjectionContext.Provider>
  );
}

function App() {
  const isMobile = useIsMobile();

  return (
    <FarmProvider>
      <ProjectionWiring>
        {isMobile ? <MobileNotice /> : <AppShell />}
      </ProjectionWiring>
    </FarmProvider>
  );
}

export default App;
