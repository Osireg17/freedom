export interface UserResponseRequest {
    interviewId: string;
    questionId: string;
    videoResponseBase64: string;
    responseTimeMs: number;
    redoAttemptNumber?: number;
}

export interface UserResponseResponse {
    success: boolean;
    responseId: string;
    status: string;
    message: string;
    runId: string;
    audioUrl?: string;
}


export interface UserResponseParams {
    interviewId: string;
    questionId: string;
    videoResponseBuffer: Buffer;
    responseTimeMs: number;
    redoAttemptNumber?: number;
}