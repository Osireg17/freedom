import type React from "react"
import { FileText, Mic, BarChart, Repeat, Star, BookOpen, Zap, MessageSquare } from "lucide-react"

export interface FeatureItem {
    icon: React.ReactNode
    title: string
    description: string
    testId: string
}

export const interviewFeatures: FeatureItem[] = [
    {
        icon: <FileText className="h-6 w-6 text-primary" />,
        title: "Job Description Analysis",
        description:
            "Upload any job description to generate custom interview questions tailored to the specific role, company culture, and industry requirements.",
        testId: "feature-job-description",
    },
    {
        icon: <Star className="h-6 w-6 text-primary" />,
        title: "Resume-Based Questions",
        description:
            "Generate personalized questions based on your resume to help you prepare for questions about your specific experience and skills.",
        testId: "feature-resume-questions",
    },
    {
        icon: <BookOpen className="h-6 w-6 text-primary" />,
        title: "Question Library",
        description:
            "Access our extensive library of behavioral and technical questions for various industries, roles, and experience levels.",
        testId: "feature-question-library",
    },
]

export const practiceFeatures: FeatureItem[] = [
    {
        icon: <Mic className="h-6 w-6 text-primary" />,
        title: "Video Response Recording",
        description:
            "Record your answers to interview questions with our intuitive interface, just like in a real HireVue interview.",
        testId: "feature-video-recording",
    },
    {
        icon: <Repeat className="h-6 w-6 text-primary" />,
        title: "Retry Options",
        description:
            "Practice makes perfect. Retry your answers up to three times per question to refine your response before submitting.",
        testId: "feature-retry-options",
    },
    {
        icon: <Zap className="h-6 w-6 text-primary" />,
        title: "Timed Responses",
        description: "Practice under realistic time constraints with customisable preparation and response timers.",
        testId: "feature-timed-responses",
    },
]

export const feedbackFeatures: FeatureItem[] = [
    {
        icon: <Star className="h-6 w-6 text-primary" />,
        title: "STAR Method Evaluation",
        description:
            "Get detailed feedback on how well your answers follow the Situation, Task, Action, Result framework that recruiters look for.",
        testId: "feature-star-evaluation",
    },
    {
        icon: <MessageSquare className="h-6 w-6 text-primary" />,
        title: "Communication Analysis",
        description:
            "Receive insights on your verbal communication including pace, clarity, filler words, and overall delivery.",
        testId: "feature-communication-analysis",
    },
    {
        icon: <BarChart className="h-6 w-6 text-primary" />,
        title: "Progress Tracking",
        description: "Monitor your improvement over time with comprehensive analytics and personalised recommendations.",
        testId: "feature-progress-tracking",
    },
]

