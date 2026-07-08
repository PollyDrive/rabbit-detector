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

function App() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileNotice /> : <AppShell />;
}

export default App;
