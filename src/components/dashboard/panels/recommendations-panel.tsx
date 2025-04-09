// src/components/dashboard/panels/recommendations-panel.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RecommendationCard } from '../cards/recommendation-card';


interface Recommendation {
    id: string;
    title: string;
    description: string;
    category: string;
}

interface RecommendationsPanelProps {
    recommendations: Recommendation[];
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
    return (
        <Card className="overflow-hidden" data-testid="recommendations-panel">
            <CardHeader>
                <CardTitle className="text-base">Practice Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-2">
                {recommendations.length > 0 ? (
                    recommendations.map((recommendation) => (
                        <RecommendationCard
                            key={recommendation.id}
                            recommendation={recommendation}
                        />
                    ))
                ) : (
                    <div className="text-center p-4">
                        <p className="text-muted-foreground text-sm">
                            Complete more interviews to receive personalized recommendations.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}