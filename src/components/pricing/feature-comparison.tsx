// src/components/pricing/feature-comparison.tsx
import { Check, X } from 'lucide-react';

interface FeatureItem {
    name: string;
    free: boolean;
    standard: boolean;
    pro: boolean;
    description?: string;
}

export function FeatureComparison() {
    const features: FeatureItem[] = [
        {
            name: 'Basic Question Library',
            free: true,
            standard: true,
            pro: true,
            description: 'Access to our library of common interview questions',
        },
        {
            name: 'Job Description-Based Questions',
            free: true,
            standard: true,
            pro: true,
            description: 'Generate questions based on specific job postings',
        },
        {
            name: 'Resume-Based Questions',
            free: true,
            standard: true,
            pro: true,
            description: 'Generate questions based on your resume',
        },
        {
            name: 'Basic STAR Method Scoring',
            free: true,
            standard: true,
            pro: true,
            description: 'Evaluation of Situation, Task, Action, Result components',
        },
        {
            name: 'Retry Attempts',
            free: false,
            standard: true,
            pro: true,
            description: 'Ability to retry answers during practice',
        },
        {
            name: 'Communication Quality Assessment',
            free: false,
            standard: true,
            pro: true,
            description: 'Feedback on clarity, conciseness, and professionalism',
        },
        {
            name: 'Content Quality Analysis',
            free: false,
            standard: true,
            pro: true,
            description: 'Evaluation of relevance, specificity, and depth',
        },
        {
            name: 'Detailed STAR Method Breakdown',
            free: false,
            standard: false,
            pro: true,
            description: 'In-depth analysis of each STAR component',
        },
        {
            name: 'Unlimited Response Storage',
            free: false,
            standard: false,
            pro: true,
            description: 'Keep all your practice sessions indefinitely',
        },
        {
            name: 'Full Question Library',
            free: false,
            standard: false,
            pro: true,
            description: 'Access to our entire library of interview questions',
        },
    ];

    return (
        <div className="w-full overflow-x-auto" data-testid="pricing-feature-comparison">
            <table className="w-full min-w-[600px] border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="py-4 text-left font-medium text-base">Feature</th>
                        <th className="px-4 py-4 text-center font-medium text-base">Free</th>
                        <th className="px-4 py-4 text-center font-medium text-base">Standard</th>
                        <th className="px-4 py-4 text-center font-medium text-base">Pro</th>
                    </tr>
                </thead>
                <tbody>
                    {features.map((feature, index) => (
                        <tr
                            key={index}
                            className={`border-b ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
                            data-testid={`pricing-feature-row-${index}`}
                        >
                            <td className="py-3 text-sm" title={feature.description}>
                                <div className="flex flex-col">
                                    <span className="font-medium">{feature.name}</span>
                                    {feature.description && (
                                        <span className="text-xs text-muted-foreground hidden md:inline-block">
                                            {feature.description}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                                {feature.free ? (
                                    <Check className="h-5 w-5 mx-auto text-primary" />
                                ) : (
                                    <X className="h-5 w-5 mx-auto text-muted-foreground" />
                                )}
                            </td>
                            <td className="px-4 py-3 text-center">
                                {feature.standard ? (
                                    <Check className="h-5 w-5 mx-auto text-primary" />
                                ) : (
                                    <X className="h-5 w-5 mx-auto text-muted-foreground" />
                                )}
                            </td>
                            <td className="px-4 py-3 text-center">
                                {feature.pro ? (
                                    <Check className="h-5 w-5 mx-auto text-primary" />
                                ) : (
                                    <X className="h-5 w-5 mx-auto text-muted-foreground" />
                                )}
                            </td>
                        </tr>
                    ))}
                    <tr className="border-b">
                        <td className="py-3 text-sm font-medium">Monthly Interviews</td>
                        <td className="px-4 py-3 text-center text-sm">3</td>
                        <td className="px-4 py-3 text-center text-sm">10</td>
                        <td className="px-4 py-3 text-center text-sm">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                        <td className="py-3 text-sm font-medium">Retry Attempts</td>
                        <td className="px-4 py-3 text-center text-sm">0</td>
                        <td className="px-4 py-3 text-center text-sm">2 per question</td>
                        <td className="px-4 py-3 text-center text-sm">3 per question</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
