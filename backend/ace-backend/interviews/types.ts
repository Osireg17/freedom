export interface JobInterviewRequest {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    yearsExperience: string;
    timeToAnswer: string;
    prepTime: string;
}

export interface JobInterviewResponse {
    interviewId: string;
    runId: string;
    status: string;
}

export interface InterviewStatusRequest {
    interviewId: string;
}

export interface InterviewStatusResponse {
    interviewId: string;
    status: string;
    message?: string;
    questionsCount?: number;
    triggerDevRunStatus?: string;
}

export interface InterviewQuestionRequest {
    interviewId: string;
    questionId: string;
}

export interface InterviewQuestionResponse {
    id: string;
    interviewId: string;
    questionNumber: number;
    questionText: string;
    questionType: string;
    timeToAnswer: number;
    prepTime: number;
    totalQuestions: number;
}

