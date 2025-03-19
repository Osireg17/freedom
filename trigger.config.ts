import { defineConfig } from '@trigger.dev/sdk/v3';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

export default defineConfig({
    project: 'proj_eirriogygtpssfirfbbl',
    runtime: 'node',
    logLevel: 'debug',
    // Set the maxDuration to 300 seconds for all tasks. See https://trigger.dev/docs/runs/max-duration
    maxDuration: 300,
    retries: {
        enabledInDev: true,
        default: {
            maxAttempts: 3,
            minTimeoutInMs: 1000,
            maxTimeoutInMs: 10000,
            factor: 2,
            randomize: true,
        },
    },
    dirs: ['trigger'],
    instrumentations: [new HttpInstrumentation()],
});
