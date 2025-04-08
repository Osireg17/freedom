// src/components/dashboard/practice-recommendation.tsx
'use client';

import { BookOpen, Mic, Star, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PracticeRecommendationProps {
    recommendation: {
        id: string;
        title: string;
        description: string;
        category: string;
    };
}

export function PracticeRecommendation({ recommendation }: PracticeRecommendationProps) {
    // Get the appropriate icon based on category
    const IconComponent = recommendation.category === 'STAR Method' ? Star :
        recommendation.category === 'Speech Pattern' ? Mic :
            recommendation.category === 'Content' ? BookOpen :
                Info;

    // Style based on category
    const categoryColor = recommendation.category === 'STAR Method' ? 'text-amber-600 bg-amber-100' :
        recommendation.category === 'Speech Pattern' ? 'text-blue-600 bg-blue-100' :
            recommendation.category === 'Content' ? 'text-purple-600 bg-purple-100' :
                'text-gray-600 bg-gray-100';

    return (
        <div
            className="p-4 border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors group"
            data-testid={`recommendation-${recommendation.id}`}
        >
            <div className="flex items-start gap-3 mb-2">
                <div className={`p-2 rounded-full ${categoryColor} dark:bg-opacity-20`}>
                    <IconComponent className="h-4 w-4" />
                </div>

                <div>
                    <h3 className="font-medium text-sm">{recommendation.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{recommendation.description}</p>
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`practice-now-button-${recommendation.id}`}
                    aria-label={`Practice ${recommendation.title} now`}
                >
                    Practice Now <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
            </div>
        </div>
    );
}