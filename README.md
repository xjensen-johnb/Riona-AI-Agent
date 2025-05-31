## Riona AI Agent 🌸

Riona AI Agent is an AI-powered automation tool designed for **Instagram and Twitter** to automate social media interactions such as posting, liking, and commenting. It leverages advanced AI models to generate engaging content, automate interactions, and manage social media accounts efficiently.

Before using the automation features, you can personalize the agent by training with the following, including:

- **YouTube Video URL** 🎥
- **Audio File** 🎙️
- **Portfolio or Website Link** 🌐
- **File Formats Supported**: PDF, DOC, DOCX, TXT 📄

## Features

- **Instagram Automation**: Automatically log in, post photos, like posts, and leave thoughtful comments.
- **Twitter Automation**: Automatically tweet, retweet, and like tweets.
- **AI-Powered Content Generation**: Use Google Generative AI to create engaging captions and comments for Instagram and Twitter.
- **Proxy Support**: Use proxies to manage multiple accounts and avoid rate limits.
- **Cookie Management**: Save and load cookies to maintain sessions across restarts.

**Upcoming Features:**

GitHub automation is planned for future development.

## Installation

1. **Clone the repository**:

   ```sh
   git clone https://github.com/david-patrick-chuks/riona-ai-agent.git
   cd riona-ai-agent
   ```

2. **Install dependencies**:

   ```sh
   npm install
   ```

3. **Set up environment variables**:
   Rename the `.env.example` file to `.env` in the root directory and add your Instagram credentials. Refer to the `.env.example` file for the required variables.
   ```dotenv # Instagram credentials
   IGusername=your_instagram_username
   IGpassword=your_instagram_password 
   
   Xusername= #Twitter username
   Xpassword= #Twitter password

   MONGODB_URI= #MongoDB URI
   ```

## Usage

1. **Run the agent**:
   ```sh
   npm start
   ```
   Note: The specific platform (Instagram, Twitter) and actions performed by the agent are typically configured through environment variables in the `.env` file, or by selections made if the application prompts for choices at runtime.

## Project Structure

- **src/client**: Contains the main logic for interacting with social media platforms like Instagram.
- **src/config**: Configuration files, including the logger setup.
- **src/utils**: Utility functions for handling errors, cookies, data saving, etc.
- **src/Agent**: Contains the AI agent logic and training scripts.
- **src/Agent/training**: Training scripts for the AI agent.
- **src/Agent/schema**: Schema definitions for AI-generated content and database models.
- **src/test**: Contains test data and scripts, such as example tweets.

## Logging

The project uses a custom logger to log information, warnings, and errors. Logs are saved in the [logs](http://_vscodecontentref_/3) directory.

## Error Handling

Process-level error handlers are set up to catch unhandled promise rejections, uncaught exceptions, and process warnings. Errors are logged using the custom logger.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- [Google Generative AI](https://ai.google/tools/) for providing the AI models.
- [Puppeteer](https://github.com/puppeteer/puppeteer) for browser automation.
- [puppeteer-extra](https://github.com/berstend/puppeteer-extra) for additional plugins and enhancements.
