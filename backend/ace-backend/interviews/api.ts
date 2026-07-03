import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import log from "encore.dev/log";
import { InterviewQuestionRequest, InterviewQuestionResponse, InterviewStatusRequest, InterviewStatusResponse, JobInterviewRequest, JobInterviewResponse } from "./types";
import { createInterview, getInterviewQuestion, getInterviewStatus } from "./Managers/InterviewManager";

export const createInterviewApi = api(
    { expose: true, method: "POST", path: "/interviews/job", auth: true },
    async (params: JobInterviewRequest): Promise<JobInterviewResponse> => {
        const authData = getAuthData();
        if (!authData || !authData.userID) {
            throw APIError.unauthenticated("User is not authenticated");
        }
        const { userID } = authData;
        log.info("creating interview", { jobTitle: params.jobTitle, companyName: params.companyName, userId: userID });
        return createInterview(params, userID);
    }
);

export const getInterviewStatusApi = api(
    { expose: true, method: "GET", path: "/interviews/:interviewId/status", auth: true },
    async (params: InterviewStatusRequest): Promise<InterviewStatusResponse> => {
        const authData = getAuthData();
        if (!authData || !authData.userID) {
            throw APIError.unauthenticated("User is not authenticated");
        }
        const { userID } = authData;
        log.info("getting interview status", { interviewId: params.interviewId, userId: userID });

        return getInterviewStatus(params.interviewId, userID);
    }
);


// endpoint: /interviews/:id/questions/:qid, fetches a single question for the recording page
export const getInterviewQuestionApi = api({
    expose: true,
    method: "GET",
    path: "/interviews/:interviewId/questions/:questionId",
    auth: true
}, async (params: InterviewQuestionRequest): Promise<InterviewQuestionResponse> => {
    // Implementation for fetching a single interview question
    const authData = getAuthData();
    if (!authData || !authData.userID) {
        throw APIError.unauthenticated("User is not authenticated");
    }
    const { userID } = authData;
    log.info("getting interview question", { interviewId: params.interviewId, questionId: params.questionId, userId: userID });


    return getInterviewQuestion(params.interviewId, params.questionId, userID);
});

