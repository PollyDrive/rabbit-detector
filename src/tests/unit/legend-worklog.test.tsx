import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Legend } from "../../components/Legend";

describe("Legend AI Worklog overlay", () => {
  it("opens and closes by close button", () => {
    render(<Legend />);

    fireEvent.click(screen.getByRole("button", { name: "AI Worklog" }));
    expect(screen.getByRole("dialog", { name: "AI Worklog" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Закрыть AI Worklog" }));
    expect(screen.queryByRole("dialog", { name: "AI Worklog" })).not.toBeInTheDocument();
  });

  it("closes by Escape", () => {
    render(<Legend />);

    fireEvent.click(screen.getByRole("button", { name: "AI Worklog" }));
    expect(screen.getByRole("dialog", { name: "AI Worklog" })).toBeVisible();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "AI Worklog" })).not.toBeInTheDocument();
  });
});
