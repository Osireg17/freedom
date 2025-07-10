'use client';

import React from 'react';
import DeviceSelector from '@/components/interviews/device/device-selector';
import DeviceBypass from './device-bypass';

interface DeviceSetupClientProps {
    interviewId: string;
    questionId: string;
}

export default function DeviceSetupClient({ interviewId, questionId }: DeviceSetupClientProps) {
    return (
        <DeviceBypass interviewId={interviewId} questionId={questionId}>
            <div className="h-screen">
                <DeviceSelector interviewId={interviewId} questionId={questionId} />
            </div>
        </DeviceBypass>
    );
}
