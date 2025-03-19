"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
    return (
        <section className="py-20 bg-muted/50" data-testid="features-hero">
            <div className="container px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4" data-testid="features-heading">
                        Features That Help You Ace Your Interviews
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8" data-testid="features-description">
                        Our AI-powered platform is specifically designed to help you master one-way video interviews with
                        personalised practice and feedback
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild data-testid="features-cta-try" aria-label="Try AceYourHireVue for free">
                            <Link href="/sign-up">Try Free</Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild data-testid="features-cta-demo" aria-label="Watch demo video">
                            <Link href="/demo">Watch Demo</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}

