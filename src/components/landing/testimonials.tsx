// src/components/landing/testimonials.tsx
export function TestimonialsSection() {
    return (
        <section className="py-20 bg-muted/50" data-testid="landing-testimonials-section">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center gap-4 text-center mb-10 md:mb-16">
                    <div className="space-y-2">
                        <h2
                            className="text-3xl font-bold tracking-tighter"
                            data-testid="landing-testimonials-heading"
                        >
                            Success Stories
                        </h2>
                        <p
                            className="mx-auto max-w-[700px] text-muted-foreground md:text-lg"
                            data-testid="landing-testimonials-description"
                        >
                            Hear from job seekers who improved their interview performance with
                            AceYourHireVue
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div
                        className="flex flex-col gap-4 p-6 bg-background rounded-lg border shadow-sm"
                        data-testid="landing-testimonial-1"
                    >
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="text-yellow-500"
                                    >
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-muted-foreground italic">
                                &quot;After practicing with AceYourHireVue for a week, I felt so
                                much more confident in my actual interview. I got the job at a tech
                                company I&apos;d been dreaming of!&quot;
                            </p>
                        </div>
                        <div className="flex items-center gap-4 pt-4 border-t">
                            <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center font-semibold">
                                JD
                            </div>
                            <div>
                                <p className="font-medium">Jamie Doe</p>
                                <p className="text-sm text-muted-foreground">Software Engineer</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="flex flex-col gap-4 p-6 bg-background rounded-lg border shadow-sm"
                        data-testid="landing-testimonial-2"
                    >
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="text-yellow-500"
                                    >
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-muted-foreground italic">
                                &quot;The feedback on my STAR responses was incredibly helpful. The
                                platform pointed out specifically where I needed to add more details
                                about results. Game changer!&quot;
                            </p>
                        </div>
                        <div className="flex items-center gap-4 pt-4 border-t">
                            <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center font-semibold">
                                TS
                            </div>
                            <div>
                                <p className="font-medium">Taylor Smith</p>
                                <p className="text-sm text-muted-foreground">Marketing Manager</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="flex flex-col gap-4 p-6 bg-background rounded-lg border shadow-sm"
                        data-testid="landing-testimonial-3"
                    >
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="text-yellow-500"
                                    >
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-muted-foreground italic">
                                &quot;As a recent graduate, I was terrified of one-way interviews.
                                This platform helped me practice until I felt comfortable. The
                                personalised questions based on job descriptions were spot on.&quot;
                            </p>
                        </div>
                        <div className="flex items-center gap-4 pt-4 border-t">
                            <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center font-semibold">
                                AR
                            </div>
                            <div>
                                <p className="font-medium">Alex Rodriguez</p>
                                <p className="text-sm text-muted-foreground">Business Analyst</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
