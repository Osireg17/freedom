import { APIError } from "encore.dev/api";
import { tasks } from "@trigger.dev/sdk/v3";
import { db, responsesBucket } from "../../db/db";
import { interviews, interviewQuestions, interviewAnswers } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import { UserResponseRequest, UserResponseResponse } from "../types";
import log from "encore.dev/log";
import { v5 as uuidv5 } from 'uuid';

const RESPONSE_NAMESPACE = "3fbc9571-0810-4c3e-bb36-3918a562479e";


export interface UserResponseParams {
    interviewId: string;
    questionId: string;
    videoResponseBuffer: Buffer;
    responseTimeMs: number;
    redoAttemptNumber?: number;
}

export async function createUserResponse(params: UserResponseParams, userId: string): Promise<UserResponseResponse> {
    const { interviewId, questionId, videoResponseBuffer, responseTimeMs, redoAttemptNumber = 0 } = params;

    log.info("Processing user response", { interviewId, questionId, userId });

    // 1. Get the interview and verify ownership
    const interview = await db.query.interviews.findFirst({
        where: eq(interviews.id, interviewId),
        columns: { userId: true }
    });

    if (!interview) {
        throw APIError.notFound("Interview not found");
    }

    if (interview.userId !== userId) {
        throw APIError.permissionDenied("You do not have permission to access this interview");
    }

    // 2. Verify the question exists
    const question = await db.query.interviewQuestions.findFirst({
        where: and(
            eq(interviewQuestions.interviewId, interviewId),
            eq(interviewQuestions.id, questionId)
        )
    });

    if (!question) {
        throw APIError.notFound("Question not found");
    }

    // 3. Generate stable, unique ID and process video file
    const responseId = uuidv5(`${interviewId}:${questionId}`, RESPONSE_NAMESPACE);
    const filename = `${responseId}.webm`;
    const filePath = `interviews/${userId}/${interviewId}/${filename}`;

    // Validate payload size early to prevent DoS
    if (!videoResponseBuffer || videoResponseBuffer.length === 0) {
        throw APIError.invalidArgument("Response payload is empty");
    }

    const MAX_PAYLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
    if (videoResponseBuffer.length > MAX_PAYLOAD_SIZE_BYTES) {
        throw APIError.invalidArgument("Response payload is too large (maximum 50MB allowed)");
    }

    log.info("Uploading response to bucket", { filePath, byteLength: videoResponseBuffer.length });

    await responsesBucket.upload(filePath, videoResponseBuffer, { contentType: 'audio/webm' });

    // 4. Create or update answer record atomically using ON CONFLICT DO UPDATE
    let finalResponseId: string;

    try {
        const [upsertedAnswer] = await db.insert(interviewAnswers)
            .values({
                id: responseId,
                interviewId,
                interviewQuestionId: questionId,
                redoAttemptNumber,
                audioUrl: filePath,
                audioDurationMs: responseTimeMs,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .onConflictDoUpdate({
                target: [interviewAnswers.interviewId, interviewAnswers.interviewQuestionId],
                set: {
                    redoAttemptNumber,
                    audioUrl: filePath,
                    audioDurationMs: responseTimeMs,
                    updatedAt: new Date()
                }
            })
            .returning({ id: interviewAnswers.id });

        if (!upsertedAnswer) {
            throw APIError.internal("Failed to save response to database");
        }
        finalResponseId = upsertedAnswer.id;
    } catch (err: any) {
        log.error("Failed to save response to database", { error: err.message });
        throw APIError.internal(`Failed to save response: ${err.message}`);
    }

    log.info("Database record updated", { finalResponseId });

    // 5. Trigger background processing task
    log.info("Triggering record-interview-task", { finalResponseId, interviewId, questionId, userId });

    const handle = await tasks.trigger(
        "record-interview-task",
        {
            responseId: finalResponseId!,
            interviewId,
            questionId,
            userId,
            audioPath: filePath
        }
    );

    log.info("Interview response submitted successfully", { finalResponseId, runId: handle.id });

    return {
        success: true,
        responseId: finalResponseId!,
        status: 'processing',
        message: 'Your response has been submitted and is being analyzed.',
        runId: handle.id,
        audioUrl: undefined
    };
}