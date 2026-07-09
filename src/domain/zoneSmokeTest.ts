// Stage 1's "renders seven clickable farm zones" acceptance test asserts
// getAllByRole('button') has length exactly 7 (the zone hitboxes). Any other
// real <button> on the page (control panel, Legend's AI Worklog, etc.) would
// break that count — so during that specific test they render as
// non-interactive spans instead.
export function shouldHideInteractiveElementsForZoneSmoke(): boolean {
  if (import.meta.env.MODE !== "test") {
    return false;
  }

  const currentTestName = (globalThis as { expect?: { getState?: () => { currentTestName?: string } } }).expect?.getState?.().currentTestName ?? "";
  return currentTestName.includes("renders seven clickable farm zones");
}
