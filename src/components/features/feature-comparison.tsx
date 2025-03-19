// src/components/features/feature-comparison.tsx
import React from 'react';
import { Check, X } from 'lucide-react';

const featureCategories = [
    {
        title: "Interview Creation",
        features: [
            {
                name: "Job Description-Based Questions",
                description: "Generate questions from any job posting",
                availableIn: ["Basic", "Standard", "Pro"]
            },
            {
                name: "Resume-Based Questions",
                description: "Generate questions from your resume",
                availableIn: ["Basic", "Standard", "Pro"]
            },
            {
                name: "Custom Interview Creation",
                description: "Create your own interview sessions",
                availableIn: ["Standard", "Pro"]
            },
            {
                name: "Question Library Access",
                description: "Browse our database of questions",
                availableIn: ["Basic", "Standard", "Pro"]
            }
        ]
    },
    {
        title: "Practice Features",
        features: [
            {
                name: "Record Responses",
                description: "Practice answering questions on video",
                availableIn: ["Basic", "Standard", "Pro"]
            },
            {
                name: "Response Replay",
                description: "Review your recorded answers",
                availableIn: ["Basic", "Standard", "Pro"]
            },
            {
                name: "Retry Attempts",
                description: "Re-record your answers for improvement",
                availableIn: ["Standard", "Pro"]
            },
            {
                name: "Unlimited Sessions",
                description: "Practice as much as you need",
                availableIn: ["Pro"]
            }
        ]
    },
    {
        title: "Analysis & Feedback",
        features: [
            {
                name: "Basic STAR Evaluation",
                description: "Simple assessment of answer structure",
                availableIn: ["Basic", "Standard", "Pro"]
            },
            {
                name: "Detailed STAR Analysis",
                description: "In-depth breakdown of each component",
                availableIn: ["Standard", "Pro"]
            },
            {
                name: "Communication Quality Assessment",
                description: "Feedback on verbal delivery",
                availableIn: ["Standard", "Pro"]
            },
            {
                name: "Speech Pattern Analysis",
                description: "Detailed metrics on speaking style",
                availableIn: ["Pro"]
            }
        ]
    }
];

export function FeatureComparison() {
    return (
        <div className="w-full overflow-x-auto" data-testid="feature-comparison">
            <table className="w-full min-w-[768px] border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="py-4 text-left font-medium text-base w-1/3">Feature</th>
                        <th className="px-4 py-4 text-center font-medium text-base">Basic</th>
                        <th className="px-4 py-4 text-center font-medium text-base">Standard</th>
                        <th className="px-4 py-4 text-center font-medium text-base">Pro</th>
                    </tr>
                </thead>
                <tbody>
                    {featureCategories.map((category, categoryIndex) => (
                        <React.Fragment key={categoryIndex}>
                            <tr className="bg-muted/50">
                                <td
                                    colSpan={4}
                                    className="py-3 px-4 font-medium text-lg"
                                    data-testid={`feature-category-${categoryIndex}`}
                                >
                                    {category.title}
                                </td>
                            </tr>
                            {category.features.map((feature, featureIndex) => (
                                <tr
                                    key={`${categoryIndex}-${featureIndex}`}
                                    className="border-b"
                                    data-testid={`feature-row-${categoryIndex}-${featureIndex}`}
                                >
                                    <td className="py-3 px-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{feature.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {feature.description}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {feature.availableIn.includes("Basic") ? (
                                            <Check
                                                className="h-5 w-5 mx-auto text-primary"
                                                data-testid={`feature-${categoryIndex}-${featureIndex}-basic-check`}
                                                aria-label={`${feature.name} is available in Basic tier`}
                                            />
                                        ) : (
                                            <X
                                                className="h-5 w-5 mx-auto text-muted-foreground"
                                                data-testid={`feature-${categoryIndex}-${featureIndex}-basic-x`}
                                                aria-label={`${feature.name} is not available in Basic tier`}
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {feature.availableIn.includes("Standard") ? (
                                            <Check
                                                className="h-5 w-5 mx-auto text-primary"
                                                data-testid={`feature-${categoryIndex}-${featureIndex}-standard-check`}
                                                aria-label={`${feature.name} is available in Standard tier`}
                                            />
                                        ) : (
                                            <X
                                                className="h-5 w-5 mx-auto text-muted-foreground"
                                                data-testid={`feature-${categoryIndex}-${featureIndex}-standard-x`}
                                                aria-label={`${feature.name} is not available in Standard tier`}
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {feature.availableIn.includes("Pro") ? (
                                            <Check
                                                className="h-5 w-5 mx-auto text-primary"
                                                data-testid={`feature-${categoryIndex}-${featureIndex}-pro-check`}
                                                aria-label={`${feature.name} is available in Pro tier`}
                                            />
                                        ) : (
                                            <X
                                                className="h-5 w-5 mx-auto text-muted-foreground"
                                                data-testid={`feature-${categoryIndex}-${featureIndex}-pro-x`}
                                                aria-label={`${feature.name} is not available in Pro tier`}
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}