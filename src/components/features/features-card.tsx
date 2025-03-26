// src/components/features/feature-card.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useErrorLogging } from '@/hooks/use-error-logging';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    details: string[];
    isNew?: boolean;
    testId: string;
}

export function FeatureCard({
    icon,
    title,
    description,
    details,
    isNew = false,
    testId
}: FeatureCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const { logError } = useErrorLogging();


    try {

        return (
            <Card
                className={cn(
                    "relative overflow-hidden transition-all duration-300",
                    isExpanded ? "shadow-md" : "shadow-sm"
                )}
                data-testid={testId}
            >
                {isNew && (
                    <div
                        className="absolute top-3 right-3 bg-primary text-primary-foreground px-2 py-1 text-xs font-medium rounded-full"
                        data-testid={`${testId}-new-badge`}
                        aria-label="New feature"
                    >
                        New
                    </div>
                )}

                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-primary/10">{icon}</div>
                        <CardTitle>{title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">{description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                    {isExpanded && (
                        <ul className="space-y-2 pt-1 pb-3" data-testid={`${testId}-details`}>
                            {details.map((detail, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-2 text-sm"
                                    data-testid={`${testId}-detail-${index}`}
                                >
                                    <span className="text-primary font-bold">•</span>
                                    <span>{detail}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <button
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        onClick={() => setIsExpanded(!isExpanded)}
                        aria-expanded={isExpanded}
                        data-testid={`${testId}-toggle-button`}
                        aria-label={isExpanded ? `Hide ${title} details` : `Show ${title} details`}
                    >
                        {isExpanded ? (
                            <>
                                <Minus className="h-4 w-4" />
                                Show less
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Show more
                            </>
                        )}
                    </button>
                </CardContent>
            </Card>
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        const errorStack = error instanceof Error ? error.stack : undefined;

        logError({
            message: errorMessage,
            stack: errorStack,
            componentStack: 'FeatureCard'
        });

        return (
            <Card data-testid={`${testId}-error`}>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        An error occurred while rendering this feature card. Please try again later.
                    </CardDescription>
                </CardContent>
            </Card>
        );
    }
}