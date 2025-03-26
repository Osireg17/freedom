import { FileText, Repeat, Star, Mic, BarChart } from "lucide-react";

const featureCards = [
    {
        icon: <FileText className="h-6 w-6 text-primary" />,
        title: "Contextual Question Generation",
        description: "Generate interview questions based on job descriptions and your resume",
        details: [
            "Upload job descriptions to create tailored question sets",
            "Generate questions based on your resume and experience",
            "Questions adapt to your experience level",
            "Industry-specific question targeting"
        ],
        testId: "feature-card-questions",
        isNew: false
    },
    {
        icon: <Repeat className="h-6 w-6 text-primary" />,
        title: "Practice & Refinement",
        description: "Record, review, and refine your responses to perfect your interview technique",
        details: [
            "Record video responses to practice questions",
            "Review your recordings with AI analysis",
            "Retry answers up to three times (depending on plan)",
            "Compare different versions of your answers"
        ],
        testId: "feature-card-practice",
        isNew: false
    },
    {
        icon: <Star className="h-6 w-6 text-primary" />,
        title: "STAR Method Evaluation",
        description: "Receive guidance on structuring effective responses using the STAR framework",
        details: [
            "Analysis of Situation, Task, Action, and Result components",
            "Specific feedback on improving each component",
            "Tips for creating well-balanced responses",
        ],
        testId: "feature-card-star",
        isNew: false
    },
    {
        icon: <Mic className="h-6 w-6 text-primary" />,
        title: "Communication Analysis",
        description: "Get detailed feedback on your verbal communication style and delivery",
        details: [
            "Speaking pace and clarity assessment",
            "Filler word detection and reduction tips",
            "Vocal variety and engagement analysis",
            "Confidence and persuasiveness metrics"
        ],
        testId: "feature-card-communication",
        isNew: true
    },
    {
        icon: <BarChart className="h-6 w-6 text-primary" />,
        title: "Progress Tracking",
        description: "Monitor your improvement with detailed analytics and performance metrics",
        details: [
            "Track improvement across multiple practice sessions",
            "Identify strengths and weaknesses by question category",
            "View detailed communication and content metrics",
            "Set improvement goals based on analytics"
        ],
        testId: "feature-card-analytics",
        isNew: false
    },
    // {
    //     icon: <BookMarked className="h-6 w-6 text-primary" />,
    //     title: "Question Library",
    //     description: "Access a comprehensive library of interview questions by industry and role",
    //     details: [
    //         "Thousands of real interview questions",
    //         "Filter by industry, company, and position",
    //         "Browse behavioral, technical, and situational questions",
    //         "Create custom practice sessions"
    //     ],
    //     testId: "feature-card-library",
    //     isNew: true
    // },
];

// Video demonstrations with descriptions
const videoSections = [
    {
        title: "Creating Job-Based Interview Sessions",
        description: "Learn how to generate relevant interview questions by uploading a job description",
        videoTitle: "Job Description Interview Generator",
        videoDescription: "This tutorial walks you through uploading a job description and configuring your practice session settings to generate customized interview questions that match the specific requirements of the position you're applying for.",
        testId: "video-demo-job-based"
    },
    {
        title: "Resume-Based Interview Preparation",
        description: "See how AceYourHireVue analyzes your resume to create personalized practice questions",
        videoTitle: "Resume Analysis and Question Generation",
        videoDescription: "This demonstration shows the resume parsing process and how our AI generates tailored questions based on your specific experience, skills, and potential gap areas that might come up in interviews.",
        testId: "video-demo-resume-based"
    },
    {
        title: "Mastering the STAR Method with AI Feedback",
        description: "Discover how detailed STAR method analysis helps improve your response structure",
        videoTitle: "STAR Method Evaluation Walkthrough",
        videoDescription: "This tutorial explains how our AI analyzes your responses using the Situation, Task, Action, Result framework, with examples of how to improve each component based on the feedback provided.",
        testId: "video-demo-star-method"
    },
    {
        title: "Communication Skills Assessment",
        description: "See how speech analysis provides insights to improve your verbal communication",
        videoTitle: "Speech Pattern and Delivery Analysis",
        videoDescription: "This video demonstrates our advanced speech analysis features, including pace, clarity, filler word detection, and speaking confidence metrics, with tips on how to interpret and act on this feedback.",
        testId: "video-demo-speech-analysis"
    }
];

export { featureCards, videoSections };