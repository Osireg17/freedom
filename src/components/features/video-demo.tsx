// src/components/features/video-demo.tsx
"use client";

import { useState } from 'react';
import { PlayCircle, Maximize, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useErrorLogging } from '@/hooks/use-error-logging';

interface VideoDemoProps {
    title: string;
    description: string;
    testId: string;
}

export function VideoDemo({ title, description, testId }: VideoDemoProps) {
    const [showInfoDialog, setShowInfoDialog] = useState(false);

    const { logError } = useErrorLogging();

    try {

        return (
            <>
                <div
                    className="relative bg-muted rounded-lg overflow-hidden border shadow-sm aspect-video flex items-center justify-center group"
                    data-testid={testId}
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-6 text-center">
                        <PlayCircle className="h-16 w-16 text-primary/50 group-hover:text-primary/80 transition-colors" />
                        <div>
                            <h3 className="text-xl font-medium mb-2">{title}</h3>
                            <p className="text-muted-foreground text-sm">
                                Video demonstration coming soon
                            </p>
                        </div>
                    </div>

                    <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-background/80 backdrop-blur-sm"
                            onClick={() => setShowInfoDialog(true)}
                            data-testid={`${testId}-info-button`}
                            aria-label="View video information"
                        >
                            <Info className="h-4 w-4 mr-1" /> Info
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-background/80 backdrop-blur-sm"
                            data-testid={`${testId}-fullscreen-button`}
                            aria-label="View video in fullscreen"
                        >
                            <Maximize className="h-4 w-4 mr-1" /> Fullscreen
                        </Button>
                    </div>
                </div>

                <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
                    <DialogContent data-testid={`${testId}-info-dialog`}>
                        <DialogHeader>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription>
                                {description}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p>
                                This video demonstration will showcase how to use this feature effectively.
                                The video is currently being produced and will be available soon.
                            </p>
                            <div className="text-sm text-muted-foreground">
                                <p>Video duration: Approximately 2-3 minutes</p>
                                <p>Last updated: March 2025</p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const errorStack = error instanceof Error ? error.stack : undefined;

        logError({
            message: errorMessage,
            stack: errorStack,
            componentStack: 'VideoDemo',
        });

        // Return a simplified fallback UI
        return (
            <div className="p-6 rounded-lg border shadow-sm" data-testid={`${testId}-error`}>
                <h3 className="text-lg font-medium mb-2">Video Demo</h3>
                <p className="text-muted-foreground">
                    An error occurred while loading the video demonstration. Please try again later.
                </p>
            </div>
        );
    }
}