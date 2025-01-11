# TwitterAgent

TwitterAgent is a Node.js application that automates interactions with Instagram and Twitter using Playwright and Google Generative AI. It can log in to Instagram, like posts, comment on posts, and generate replies using the Gemini AI model.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

```sh
git clone https://github.com/david-patrick-chuks/Instagram-Agent.git
cd Instagram-Agent

## Project Structure

- `Agent.js`: Main script that handles Instagram login, post interactions, and comment generation.
- `twitter.js`: Script for generating image descriptions and tweet replies using Gemini AI.
- `cookies.json`: Stores cookies for Instagram login sessions.
- `.env`: Environment variables for Instagram credentials and Gemini API keys.
- `.env.example`: Example environment variables file.
- `package.json`: Project metadata and dependencies.
- `.gitignore`: Specifies files and directories to be ignored by Git.
- `settings.json`: VS Code workspace settings.

## Functions

### `loginToInstagram()`

Logs in to Instagram using the provided credentials and saves cookies for future sessions.

### `interactWithPosts(page)`

Interacts with Instagram posts by liking and commenting on them. Comments are generated using the Gemini AI model.

### `generatePostReply(postCaption)`

Generates a thoughtful and engaging reply to a given Instagram post caption using the Gemini AI model.

### `cookiesExist()`

Checks if the cookies file exists and if the cookies are still valid.

### `highlightElement(page, postIndex, elementType)`

Highlights elements on the Instagram page for debugging purposes.

## Example Code:

```javascript
// Highlight comment box in green when commenting
if (elementType === "comment" && commentBox) {
    await page.evaluate((box) => {
        box.style.border = "3px solid green";
        box.style.transition = "border 0.5s ease";
    }, commentBox);
} else {
    // If not commenting, reset the comment box border
    await page.evaluate(() => {
        const boxes = document.querySelectorAll('textarea');
        boxes.forEach((box) => {
            box.style.border = "";
        });
    });
}

// Optionally, reset the body border if necessary
if (elementType !== "like" && elementType !== "comment") {
    await page.evaluate(() => {
        document.body.style.border = "";
    });
}