import { IgApiClient, MediaRepositoryConfigureResponseRootObject } from 'instagram-private-api';
import { get } from 'request-promise';
import { CronJob } from 'cron';

interface IInstagramClient {
    username: string;
    password: string;
    ig: IgApiClient;
    login(): Promise<void>;
    postPhoto(url: string, caption?: string): Promise<MediaRepositoryConfigureResponseRootObject>;
    schedulePost(url: string, caption: string, cronTime: string): Promise<void>;
}

// InstagramClient Class
class InstagramClient implements IInstagramClient {
    username: string;
    password: string;
    ig: IgApiClient;

    constructor(username: string, password: string) {
        if (!username || !password) {
            throw new Error("Username and password are required.");
        }
        this.ig = new IgApiClient();
        this.username = username;
        this.password = password;
    }

    async login(): Promise<void> {
        console.log(`Logging in as ${this.username}...`);
        this.ig.state.generateDevice(this.username);
        await this.ig.account.login(this.username, this.password);
        console.log("Login successful!");
    }

    async postPhoto(url: string, caption: string = ''): Promise<MediaRepositoryConfigureResponseRootObject> {
        if (!url) {
            throw new Error("Image URL is required.");
        }

        console.log("Fetching image...");
        const imageBuffer = await get({
            url,
            encoding: null, // Ensures image is retrieved as a buffer
        });

        console.log("Uploading photo...");
        const response = await this.ig.publish.photo({
            file: imageBuffer,
            caption,
        });

        console.log("Photo posted successfully!");
        return response;
    }

    async schedulePost(url: string, caption: string, cronTime: string): Promise<void> {
        if (!url || !cronTime) {
            throw new Error("Image URL and cron time are required.");
        }

        console.log(`Scheduling post for: ${cronTime}`);
        const job = new CronJob(cronTime, async () => {
            try {
                await this.postPhoto(url, caption);
            } catch (error) {
                console.error("Error during scheduled post:", (error as Error).message);
            }
        });

        job.start();
        console.log("Cron job started.");
    }
}

// Usage Example
(async () => {
    const username = process.env.IG_USERNAME; // Set your Instagram username in environment variables
    const password = process.env.IG_PASSWORD; // Set your Instagram password in environment variables

    if (!username || !password) {
        console.error("Please set IG_USERNAME and IG_PASSWORD in environment variables.");
        return;
    }

    const client = new InstagramClient(username, password);

    try {
        await client.login();

        // Post immediately
        await client.postPhoto(
            'https://i.imgur.com/BZBHsauh.jpg',
            'Really nice photo from the internet!'
        );

        // Schedule a post
        await client.schedulePost(
            'https://i.imgur.com/BZBHsauh.jpg',
            'Scheduled post with a great view!',
            '0 9 * * *' // Cron time: Every day at 9 AM
        );
    } catch (error) {
        console.error("Error:", (error as Error).message);
    }
})();