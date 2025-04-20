// Centralised client/server interview status types

export enum InterviewStatus {
    PROCESSING = 'processing',
    COMPLETED  = 'completed',
    ERROR      = 'error',
  }
  
  export interface InterviewStatusResponse {
    interviewId: string;
    status: InterviewStatus;
    message: string;
    questionsCount: number;
  }
  