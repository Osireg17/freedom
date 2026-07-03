import { APIError } from "encore.dev/api";
import { tasks } from "@trigger.dev/sdk/v3";
import { db, responsesBucket } from "../../db/db";
import { interviews, interviewQuestions, interviewAnswers } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import { UserResponseParams, UserResponseRequest, UserResponseResponse } from "../types";
import log from "encore.dev/log";
import { v5 as uuidv5 } from 'uuid';

const RESPONSE_NAMESPACE = "3fbc9571-0810-4c3e-bb36-3918a562479e";

/**
 * Create or update a candidate's response to an interview question.
 *
 * Verifies that the interview exists and belongs to the active user, validates the
 * question, and uploads the video response to responses storage. The database record and the
 * Trigger.dev task are initialized atomically. If any post-upload operations (DB write or task dispatch)
 * fail, the uploaded video is cleaned up from storage to prevent orphaned objects.
 *
 * Preconditions:
 * - User must be authenticated and own the specified interview.
 * - The question must exist within the specified interview.
 *
 * Constraints:
 * - videoResponseBuffer must not be empty and must be <= 50MB.
 *
 * Side effects:
 * - Uploads video payload to responsesBucket.
 * - Deletes the uploaded video on DB or task triggering failures.
 * - Inserts or updates the answer record in the database.
 * - Triggers the background transcription task (record-interview-task).
 *
 * Signals:
 * - Interview not found -> NotFound
 * - Interview does not belong to user -> PermissionDenied
 * - Question not found -> NotFound
 * - Payload empty or > 50MB -> InvalidArgument
 * - Database insert failure -> Internal
 * - Trigger task failure -> Internal
 */
export async function createUserResponse(params: UserResponseParams, userId: string): Promise<UserResponseResponse> {
    // TODO: Verify interview exists and matches user ownership
    // TODO: Verify question exists
    // TODO: Validate buffer length constraints (empty or > 50MB)
    // TODO: Upload video to responsesBucket
    // TODO: Within a try-catch block:
    //       1. Insert or update the answer record in DB atomically
    //       2. Trigger the record-interview-task background task
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

    // 4. Create or update answer record atomically and trigger background task
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
        const finalResponseId = upsertedAnswer.id;

        log.info("Database record updated", { finalResponseId });

        // 5. Trigger background processing task
        log.info("Triggering record-interview-task", { finalResponseId, interviewId, questionId, userId });

        const handle = await tasks.trigger(
            "record-interview-task",
            {
                responseId: finalResponseId,
                interviewId,
                questionId,
                userId,
                audioPath: filePath
            }
        );

        log.info("Interview response submitted successfully", { finalResponseId, runId: handle.id });

        return {
            success: true,
            responseId: finalResponseId,
            status: 'processing',
            message: 'Your response has been submitted and is being analyzed.',
            runId: handle.id,
            audioUrl: undefined
        };
    } catch (err: any) {
        log.error("Failed to process user response, cleaning up bucket file", { error: err.message });
        try {
            await responsesBucket.remove(filePath);
        } catch (cleanupErr: any) {
            log.error("Failed to delete video file from bucket during cleanup", { error: cleanupErr.message });
        }
        throw APIError.internal(`Failed to save response: ${err.message}`);
    }
}