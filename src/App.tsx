import { useEffect, useState } from 'react';
import './App.css';
import AppShell from "./components/AppShell";
import { MobileNotice } from "./components/MobileNotice";

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

import { FarmProvider } from "./context/FarmContext";

function App() {
  const isMobile = useIsMobile();

  return (
    <FarmProvider>
      {isMobile ? <MobileNotice /> : <AppShell />}
    </FarmProvider>
  );
}

export default App;
