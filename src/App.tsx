import { useEffect, useState } from 'react';
import AppShell from "./components/AppShell";
import { MobileNotice } from "./components/MobileNotice";
import { FarmProvider } from "./context/FarmContext";
import { MOBILE_BREAKPOINT_PX } from "./domain/config";

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

function App() {
  const isMobile = useIsMobile();

  return (
    <FarmProvider>
      {isMobile ? <MobileNotice /> : <AppShell />}
    </FarmProvider>
  );
}

export default App;
