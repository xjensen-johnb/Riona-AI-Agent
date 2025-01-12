import { YoutubeTranscript } from 'youtube-transcript';
import { generateTrainingPrompt } from '../script/summarize';
import logger from '../../config/logger';


/**
 * Fetches the transcript of a given YouTube video URL.
 * @param url - The YouTube video URL.
 * @returns A promise that resolves to the transcript text or an error message.
 */
async function getYouTubeTranscript(url: string): Promise<string> {
    try {
        let videoId: string | null = null;

        // Handle both full YouTube URL and shortened YouTube URL
        const parsedUrl = new URL(url);

        // If the URL is a full YouTube URL (youtube.com/watch?v=...)
        if (parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtube.com') {
            videoId = parsedUrl.searchParams.get("v");
        }

        // If the URL is a shortened YouTube URL (youtu.be/kTADMgEDlIQ)
        else if (parsedUrl.hostname === 'youtu.be') {
            videoId = parsedUrl.pathname.split("/")[1];  // Extract the video ID from the path
        }

        // If we couldn't extract a video ID, throw an error
        if (!videoId) {
            throw new Error("Invalid YouTube URL");
        }

        // Fetch the transcript using the video ID
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);

        // Check if the transcript is empty
        if (transcript.length === 0) {
            return "No captions available for this video.";
        }

        // Combine the transcript text into one string
        return transcript.map(item => item.text).join(' ');
    } catch (error) {
        if (error instanceof Error) {
            return `Error fetching transcript: ${error.message}`;
        }
        return "An unknown error occurred.";
    }
}



/**
 * Trains the agent using the transcript of a given YouTube video URL.
 * @param url - The YouTube video URL.
 * @returns A promise that resolves to the training prompt or an error message.
 * The returned object is an array of objects, each containing:
 *  - `transcriptTitle`: The title of the YouTube video transcript.
 *  - `fullTranscript`: The full, transformed YouTube video transcript.
 *  - `contentTokenCount`: The total number of tokens in the full transcript.
 */

export async function Train_Agent_with_Youtube_URL(url: string) {
    try {
        const transcript = await getYouTubeTranscript(url);
        if (!transcript) {
            throw new Error('Failed to retrieve transcript from YouTube.');
        }
        const source = await generateTrainingPrompt(transcript);
        if (!source) {
            throw new Error('Failed to generate training prompt.');
        }
        // logger.debug("Training source generated : Title" , source[0]?.transcriptTitle)
        console.log("Training source generated : Title" , source)
        return source;
    } catch (error) {
        logger.error('Error in Train_Agent_with_Youtube_URL:', error);
        // Return an error message or handle it accordingly
        return { error: error instanceof Error ? error.message : `Error in Train_Agent_with_Youtube_URL: ${error}` };
    }
}

const url = 'https://youtu.be/jSQ6Mru88y4?si=viP_FOYSD1AeVcZ9'
Train_Agent_with_Youtube_URL(url)
