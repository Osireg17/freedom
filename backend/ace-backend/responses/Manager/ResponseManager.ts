import { APIError } from "encore.dev/api";
import { tasks } from "@trigger.dev/sdk/v3";
import { db, responsesBucket } from "../../db/db";
import { interviews, interviewQuestions, interviewAnswers } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import { UserResponseRequest, UserResponseResponse } from "../types";
import log from "encore.dev/log";

export async function createUserResponse(params: UserResponseRequest, userId: string): Promise<UserResponseResponse> {
    const { interviewId, questionId, videoResponseBase64, responseTimeMs, redoAttemptNumber = 0 } = params;

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

    // 3. Generate unique IDs and process video file
    const responseId = crypto.randomUUID();
    const filename = `${responseId}.webm`;
    const filePath = `interviews/${userId}/${interviewId}/${filename}`;

    // Decode base64 to buffer
    const audioBuffer = Buffer.from(videoResponseBase64, 'base64');

    log.info("Uploading response to bucket", { filePath, byteLength: audioBuffer.byteLength });

    await responsesBucket.upload(filePath, audioBuffer, { contentType: 'audio/webm' });

    // 4. Create or update answer record inside a transaction to prevent a race condition
    // where two simultaneous submissions for the same question both read no existing row
    // and then both attempt to insert, causing a unique constraint violation.
    let finalResponseId!: string;

    await db.transaction(async (tx) => {
        const existingAnswer = await tx.query.interviewAnswers.findFirst({
            where: and(
                eq(interviewAnswers.interviewId, interviewId),
                eq(interviewAnswers.interviewQuestionId, questionId)
            )
        });

        finalResponseId = existingAnswer ? existingAnswer.id : responseId;

        if (existingAnswer) {
            await tx.update(interviewAnswers)
                .set({
                    redoAttemptNumber,
                    audioUrl: filePath,
                    audioDurationMs: responseTimeMs,
                    updatedAt: new Date()
                })
                .where(eq(interviewAnswers.id, existingAnswer.id));
        } else {
            await tx.insert(interviewAnswers).values({
                id: responseId,
                interviewId,
                interviewQuestionId: questionId,
                redoAttemptNumber,
                audioUrl: filePath,
                audioDurationMs: responseTimeMs,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
    });

    log.info("Database record updated", { finalResponseId: finalResponseId! });

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