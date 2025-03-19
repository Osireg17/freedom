import type React from "react"
import { Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface FeatureCardProps {
    icon: React.ReactNode
    title: string
    description: string
    testId: string
}

export function FeatureCard({ icon, title, description, testId }: FeatureCardProps) {
    return (
        <Card className="h-full" data-testid={testId}>
            <CardContent className="flex flex-col gap-4 pt-6">
                <div className="p-2 w-fit rounded-full bg-primary/10">{icon}</div>
                <div>
                    <h3 className="text-xl font-semibold mb-2">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                </div>
                <div
                    className="mt-4 aspect-video bg-muted/50 rounded-lg flex flex-col items-center justify-center border border-dashed border-muted-foreground/50"
                    data-testid={`${testId}-video-placeholder`}
                >
                    <Play className="h-10 w-10 text-muted-foreground/70 mb-2" />
                    <p className="text-sm text-muted-foreground">Video demonstration coming soon</p>
                </div>
            </CardContent>
        </Card>
    )
}

