import {defineConfig, devices} from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });
const isCI = !!process.env.CI;
const retries = isCI ? 2 : 0;

export default defineConfig({

    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: retries,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'https://automationintesting.online/',
        trace: 'on-first-retry',
    },
    timeout: 30_000,

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                locale: 'ru-RU',
                viewport: {width: 1440, height: 900},
                screenshot: 'only-on-failure',
                video: 'retain-on-failure',
            },
        },
    ],

});
