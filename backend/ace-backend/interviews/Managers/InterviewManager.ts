import { APIError } from "encore.dev/api";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import { db } from "../../db/db";
import { interviews, interviewQuestions } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import { JobInterviewRequest, JobInterviewResponse, InterviewStatusResponse } from "../types";
import log from "encore.dev/log";

export async function createInterview(params: JobInterviewRequest, userId: string): Promise<JobInterviewResponse> {
    const interviewId = crypto.randomUUID();

    log.info("triggering interview question generation", { interviewId, userId, jobTitle: params.jobTitle, companyName: params.companyName });

    const handle = await tasks.trigger(
        "generate-job-interview-questions",
        {
            interviewId,
            userId,
            jobTitle: params.jobTitle,
            companyName: params.companyName,
            jobDescription: params.jobDescription,
            yearsExperience: parseInt(params.yearsExperience),
            timeToAnswer: parseInt(params.timeToAnswer),
            prepTime: parseInt(params.prepTime),
        }
    );

    log.info("interview generation triggered", { interviewId, runId: handle.id });

    await db.insert(interviews).values({
        id: interviewId,
        userId,
        interviewType: "ai",
        companyName: params.companyName,
        jobPosition: params.jobTitle,
        jobDescription: params.jobDescription,
        jobExperience: params.yearsExperience,
        timeToAnswer: parseInt(params.timeToAnswer),
        triggerRunId: handle.id,
        status: "not_started",
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    log.info("interview created", { interviewId, userId });

    return {
        interviewId,
        runId: handle.id,
        status: "processing",
    };
}

export async function getInterviewStatus(interviewId: string, userId: string): Promise<InterviewStatusResponse> {

    log.info("fetching interview status", { interviewId, userId });

    const interview = await db.query.interviews.findFirst({
        where: eq(interviews.id, interviewId),
        columns: { userId: true, triggerRunId: true },
    });

    if (!interview) {
        throw APIError.notFound("interview not found");
    }

    if (interview.userId !== userId) {
        throw APIError.permissionDenied("cannot access another user's interview");
    }

    if (!interview.triggerRunId) {
        throw APIError.internal("interview has no associated run ID");
    }

    const runDetails = await runs.retrieve(interview.triggerRunId);

    log.info("fetched interview status", { interviewId, userId, runStatus: runDetails.status });


    let status: "processing" | "completed" | "error" = "processing";
    let message = "Interview questions are being generated.";

    switch (runDetails.status) {
        case "COMPLETED":
            if (runDetails.isSuccess) {
                status = "completed";
                message = "Interview questions have been generated successfully.";
            } else {
                status = "error";
                message = "Interview generation failed.";
            }
            break;
        case "CANCELED":
        case "FAILED":
        case "CRASHED":
        case "SYSTEM_FAILURE":
            status = "error";
            message = `Interview generation encountered an error: ${runDetails.status}.`;
            break;
        default:
            status = "processing";
            message = `Interview generation is currently: ${runDetails.status}.`;
    }

    log.info("determined interview status", { interviewId, userId, status, message });

    const questions = await db.query.interviewQuestions.findMany({
        where: eq(interviewQuestions.interviewId, interviewId),
        columns: { id: true },
    });

    log.info("fetched interview questions", { interviewId, userId, questionsCount: questions.length });

    return {
        interviewId,
        status,
        message,
        questionsCount: questions.length,
        triggerDevRunStatus: runDetails.status,
    };
}


export async function getInterviewQuestion(interviewId: string, questionId: string, userId: string) {


    const interview = await db.query.interviews.findFirst({
        where: eq(interviews.id, interviewId),
        columns: { userId: true, timeToAnswer: true },
    });

    log.info("fetching interview question", { interviewId, questionId, userId });

    if (!interview) {
        throw APIError.notFound("interview not found");
    }

    if (interview?.userId !== userId) {
        throw APIError.permissionDenied("cannot access another user's interview");
    }

    const question = await db.query.interviewQuestions.findFirst({
        where: and(
            eq(interviewQuestions.interviewId, interviewId),
            eq(interviewQuestions.id, questionId)
        )
    });

    if (!question) {
        throw APIError.notFound("question not found");
    }

    log.info("fetched interview question", { interviewId, questionId, userId });

    const findAllQuestions = await db.query.interviewQuestions.findMany({
        where: eq(interviewQuestions.interviewId, interviewId),
        columns: { id: true },
    });

    log.info("fetched all interview questions for question response", { interviewId, questionId, userId, totalQuestions: findAllQuestions.length });

    const totalQuestions = findAllQuestions.length;

    return {
        id: question.id,
        interviewId: question.interviewId,
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        questionType: question.questionType,
        timeToAnswer: interview.timeToAnswer ?? 0,
        prepTime: 30,
        totalQuestions
    };

}
