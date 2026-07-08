import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AppShell from "../../components/AppShell";

describe("src/tests/acceptance/stage1-shell.test.ts", () => {
  it("renders_canvas_shell", () => {
    render(<AppShell />);
    
    const shell = screen.getByTestId("app-shell");
    expect(shell).toBeInTheDocument();
    
    expect(screen.getByTestId("control-area")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-area")).toBeInTheDocument();
    expect(screen.getByTestId("overlay-triggers")).toBeInTheDocument();
    
    expect(screen.getByTestId("hitbox-garden")).toBeInTheDocument();
    expect(screen.getByTestId("hitbox-greenhouse")).toBeInTheDocument();
    expect(screen.getByTestId("hitbox-barn")).toBeInTheDocument();
    expect(screen.getByTestId("hitbox-fence-west")).toBeInTheDocument();
    expect(screen.getByTestId("hitbox-fence-sw")).toBeInTheDocument();
    expect(screen.getByTestId("hitbox-fence-se")).toBeInTheDocument();
    expect(screen.getByTestId("hitbox-fence-east")).toBeInTheDocument();
  });

  it("keeps_desktop_layout_intact", () => {
    render(<AppShell />);
    const container = screen.getByTestId("app-shell-container");
    expect(container).toHaveStyle({ minWidth: "2752px" });
  });
  
  it("opens popup on zone click", () => {
    render(<AppShell />);
    
    const garden = screen.getByTestId("hitbox-garden");
    fireEvent.click(garden);
    
    expect(screen.getByTestId("zone-popup")).toHaveTextContent("garden");
  });
});
