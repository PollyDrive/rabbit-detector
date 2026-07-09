export interface MockedRecommendation {
  zone: string;
  priority: number;
  text: string;
}

export interface RecommendationsProjection {
  recommendations: MockedRecommendation[];
}

export function getRecommendationItems(projection: RecommendationsProjection): MockedRecommendation[] {
  return [...projection.recommendations];
}
