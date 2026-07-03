import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import log from "encore.dev/log";
import { UserResponseRequest, UserResponseResponse } from "./types";
import { createUserResponse } from "./Manager/ResponseManager";

export const getResponseApi = api(
    { expose: true, method: "POST", path: "/interviews/:interviewId/questions/:questionId/response", auth: true },
    async (params: UserResponseRequest): Promise<UserResponseResponse> => {
        const authData = getAuthData();
        if (!authData || !authData.userID) {
            throw APIError.unauthenticated("User is not authenticated");
        }
        const { userID } = authData;
        log.info("getting user response", { interviewId: params.interviewId, questionId: params.questionId, userId: userID });

        return createUserResponse(params, userID);
    }
);