'use client';

import React from 'react';
import DeviceSelector from '@/components/interviews/device/device-selector';

interface DeviceSetupClientProps {
    interviewId: string;
    questionId: string;
}

export default function DeviceSetupClient({ interviewId, questionId }: DeviceSetupClientProps) {
    return (
        <div className="h-screen">
            <DeviceSelector interviewId={interviewId} questionId={questionId} />
        </div>
    );
}
