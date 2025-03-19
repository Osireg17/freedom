// src/components/pricing/pricing-card.tsx
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PricingFeature {
    text: string;
    included: boolean;
}

interface PricingCardProps {
    title: string;
    price: string;
    description: string;
    features: PricingFeature[];
    buttonText: string;
    buttonLink: string;
    isPopular?: boolean;
    testId: string;
}

export function PricingCard({
    title,
    price,
    description,
    features,
    buttonText,
    buttonLink,
    isPopular = false,
    testId,
}: PricingCardProps) {
    return (
        <div
            className={`relative rounded-lg border p-6 shadow-sm ${
                isPopular ? 'border-primary bg-primary/5 shadow-md' : 'bg-background'
            }`}
            data-testid={testId}
        >
            {isPopular && (
                <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 text-xs font-medium text-white rounded-full"
                    data-testid={`${testId}-popular-badge`}
                >
                    Most Popular
                </div>
            )}
            <div className="mb-5 space-y-1">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            <div className="mb-5">
                <span className="text-3xl font-bold">{price}</span>
                {price !== 'Free' && <span className="text-muted-foreground ml-1">/month</span>}
            </div>
            <div className="mb-6 space-y-3">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-2"
                        data-testid={`${testId}-feature-${index}`}
                    >
                        <div
                            className={`rounded-full p-1 ${feature.included ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                        >
                            <Check className="h-4 w-4" />
                        </div>
                        <span
                            className={`text-sm ${feature.included ? '' : 'text-muted-foreground'}`}
                        >
                            {feature.text}
                        </span>
                    </div>
                ))}
            </div>
            <Button
                asChild
                className={`w-full ${isPopular ? '' : 'bg-primary'}`}
                variant={isPopular ? 'default' : 'default'}
                data-testid={`${testId}-button`}
                aria-label={`Sign up for the ${title} plan`}
            >
                <Link href={buttonLink}>{buttonText}</Link>
            </Button>
        </div>
    );
}
