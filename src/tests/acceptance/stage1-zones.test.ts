import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FarmMap } from "../../components/FarmMap";
import { ZONES } from "../../domain/zones";

describe("Stage 1 - Zones", () => {
  it("renders_all_7_hitboxes", () => {
    render(React.createElement(FarmMap));
    
    const locations = Object.values(ZONES).map(z => z.location);
    expect(locations.length).toBe(7);

    for (const loc of locations) {
      const hitbox = screen.getByTestId(`zone-${loc}`);
      expect(hitbox).toBeInTheDocument();
      expect(hitbox.title).toBe(loc);
    }
  });

  it("maps_clicks_to_correct_locations", () => {
    const onZoneClick = vi.fn();
    render(React.createElement(FarmMap, { onZoneClick }));

    const locations = Object.values(ZONES).map(z => z.location);
    
    for (const loc of locations) {
      const hitbox = screen.getByTestId(`zone-${loc}`);
      fireEvent.click(hitbox);
      expect(onZoneClick).toHaveBeenCalledWith(loc);
    }
    
    expect(onZoneClick).toHaveBeenCalledTimes(7);
  });
});
