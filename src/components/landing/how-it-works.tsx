// src/components/landing/how-it-works.tsx
export function HowItWorksSection() {
    return (
        <section
            id="how-it-works"
            className="w-full py-20"
            data-testid="landing-how-it-works-section"
        >
            <div className="container mx-auto px-4 md:px-6 text-center">
                <div className="max-w-4xl mx-auto mb-12">
                    <h2
                        className="text-3xl md:text-4xl font-bold tracking-tighter mb-4"
                        data-testid="landing-how-it-works-heading"
                    >
                        How AceYourHireVue Works
                    </h2>
                    <p
                        className="text-xl text-muted-foreground mx-auto max-w-3xl"
                        data-testid="landing-how-it-works-description"
                    >
                        Our simple 4-step process will help you prepare for your one-way video
                        interviews
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-8 md:gap-12">
                    <div
                        className="flex flex-col items-center text-center"
                        data-testid="landing-step-1"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg mb-4">
                            1
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Create Your Session</h3>
                        <p className="text-muted-foreground">
                            Upload a job description or resume to generate relevant interview
                            questions.
                        </p>
                    </div>

                    <div
                        className="flex flex-col items-center text-center"
                        data-testid="landing-step-2"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg mb-4">
                            2
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Practice Your Answers</h3>
                        <p className="text-muted-foreground">
                            Record your responses to questions, with options to retry up to 3 times.
                        </p>
                    </div>

                    <div
                        className="flex flex-col items-center text-center"
                        data-testid="landing-step-3"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg mb-4">
                            3
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Receive AI Feedback</h3>
                        <p className="text-muted-foreground">
                            Get detailed analysis on your content, delivery, and communication
                            style.
                        </p>
                    </div>

                    <div
                        className="flex flex-col items-center text-center"
                        data-testid="landing-step-4"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg mb-4">
                            4
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
                        <p className="text-muted-foreground">
                            Monitor your improvement over time and focus on areas that need
                            attention.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
