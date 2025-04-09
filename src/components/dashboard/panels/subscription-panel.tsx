// src/components/dashboard/panels/subscription-panel.tsx
'use client';

import { CrownIcon, CheckIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface SubscriptionPanelProps {
    subscription: {
        tier: string;
        interviewsRemaining: number;
        nextReset: string;
    };
}

export function SubscriptionPanel({ subscription }: SubscriptionPanelProps) {
    const nextReset = new Date(subscription.nextReset);
    const formattedReset = nextReset.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const totalInterviews = subscription.tier === 'free' ? 3 : subscription.tier === 'standard' ? 10 : Infinity;
    const interviewsUsed = totalInterviews === Infinity ? 0 : totalInterviews - subscription.interviewsRemaining;
    const progressPercentage = totalInterviews === Infinity ? 0 : (interviewsUsed / totalInterviews) * 100;

    return (
        <Card className="overflow-hidden" data-testid="subscription-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold uppercase">
                    {subscription.tier === 'free' ? 'Free Plan' :
                        subscription.tier === 'standard' ? 'Standard Plan' :
                            'Pro Plan'}
                </CardTitle>
                {subscription.tier !== 'pro' && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary bg-white hover:bg-primary/10 dark:bg-transparent dark:hover:bg-primary/20"
                        data-testid="upgrade-button"
                        aria-label="Upgrade your subscription"
                    >
                        <CrownIcon className="h-3 w-3 mr-1" />
                        Upgrade
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-4">
                {subscription.tier !== 'pro' ? (
                    <>
                        <div className="flex justify-between items-center text-sm mb-1.5">
                            <div>Interviews Remaining</div>
                            <div className="font-medium">
                                {subscription.interviewsRemaining} of {totalInterviews}
                            </div>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        <div className="mt-1 text-xs text-muted-foreground">Resets on {formattedReset}</div>
                    </>
                ) : (
                    <div className="py-2">
                        <div className="text-sm font-medium">Unlimited interviews available</div>
                        <div className="text-xs text-muted-foreground mt-1">All pro features unlocked</div>
                    </div>
                )}
            </CardContent>
            {subscription.tier !== 'pro' && (
                <CardFooter className="p-4 bg-muted/50 flex flex-col items-start">
                    <h4 className="text-xs font-medium mb-2">Upgrade to get more features:</h4>
                    <ul className="text-xs space-y-1.5 w-full">
                        {subscription.tier === 'free' ? (
                            <>
                                <li className="flex items-center">
                                    <CheckIcon className="h-3 w-3 mr-2 text-blue-500" />
                                    Retry attempts for better practice
                                </li>
                                <li className="flex items-center">
                                    <CheckIcon className="h-3 w-3 mr-2 text-blue-500" />
                                    Detailed STAR method feedback
                                </li>
                                <li className="flex items-center">
                                    <CheckIcon className="h-3 w-3 mr-2 text-blue-500" />
                                    Basic speech metrics analysis
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="flex items-center">
                                    <CheckIcon className="h-3 w-3 mr-2 text-indigo-500" />
                                    Unlimited interviews
                                </li>
                                <li className="flex items-center">
                                    <CheckIcon className="h-3 w-3 mr-2 text-indigo-500" />
                                    Advanced speech pattern analysis
                                </li>
                                <li className="flex items-center">
                                    <CheckIcon className="h-3 w-3 mr-2 text-indigo-500" />
                                    Interpersonal traits assessment
                                </li>
                            </>
                        )}
                    </ul>
                </CardFooter>
            )}
        </Card>
    );
}