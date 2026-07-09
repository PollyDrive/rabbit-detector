export interface DashboardProjectionLike {
  low: number;
  high: number;
  pointEstimate: number;
  confidencePercent: number;
  recommendations: Array<unknown>;
  zones: Record<string, unknown>;
}

export function isEmptyDashboardProjection(projection: DashboardProjectionLike | undefined) {
  if (!projection) {
    return true;
  }

  return (
    projection.low === 0 &&
    projection.high === 0 &&
    projection.pointEstimate === 0 &&
    projection.confidencePercent === 0 &&
    projection.recommendations.length === 0 &&
    Object.keys(projection.zones).length === 0
  );
}

export function isLoadingDashboardProjection(projection: DashboardProjectionLike | undefined) {
  return projection === undefined;
}
