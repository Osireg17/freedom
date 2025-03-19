import { FeatureItem } from "./data/features"
import { FeatureCard } from "./features-card"

interface FeatureSectionProps {
    title: string
    description: string
    features: FeatureItem[]
    testId: string
}

export function FeatureSection({ title, description, features, testId }: FeatureSectionProps) {
    return (
        <section className="py-16 border-t" data-testid={testId}>
            <div className="container px-4 md:px-6">
                <div className="max-w-3xl mx-auto mb-12 text-center">
                    <h2 className="text-3xl font-bold mb-4" data-testid={`${testId}-heading`}>
                        {title}
                    </h2>
                    <p className="text-xl text-muted-foreground" data-testid={`${testId}-description`}>
                        {description}
                    </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <FeatureCard
                            key={feature.testId}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            testId={feature.testId}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

