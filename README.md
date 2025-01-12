## Riona-AI-Agent 🌸

Riona-AI-Agent is an AI-powered automation tool designed to interact with various social media platforms like Instagram, Twitter, and GitHub. It leverages advanced AI models to generate engaging content, automate interactions, and manage social media accounts efficiently.

## Features

- **Instagram Automation**: Automatically log in, like posts, and leave thoughtful comments.
- **Twitter Automation**: (Coming soon) Automatically tweet, retweet, and like tweets.
- **GitHub Automation**: (Coming soon) Automatically manage repositories, issues, and pull requests.
- **AI-Powered Content Generation**: Use Google Generative AI to generate engaging comments and posts.
- **Proxy Support**: Use proxies to manage multiple accounts and avoid rate limits.
- **Cookie Management**: Save and load cookies to maintain sessions across restarts.

## Installation

1. **Clone the repository**:
    ```sh
    git clone https://github.com/david-patrick-chuks/Riona-AI-Agent.git
    cd Riona-AI-Agent
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Set up environment variables**:
    rename the [.env.example](http://_vscodecontentref_/1) file to  [.env](http://_vscodecontentref_/1)  file in the root directory and add your credentials and API keys (optional). Refer to the [.env.example](http://_vscodecontentref_/2) file for the required variables.
    ```dotenv
    # Instagram credentials
    IGusername=your_instagram_username
    IGpassword=your_instagram_password

    # Twitter credentials
    Xusername=your_twitter_username
    Xpassword=your_twitter_password

    ```

## Usage

1. **Run the agent**:
    ```sh
    npm start
    ```

<!-- 2. **Run the Twitter agent** (Coming soon):
    ```sh
    npm run start:twitter
    ```

3. **Run the GitHub agent** (Coming soon):
    ```sh
    npm run start:github
    ``` -->

## Project Structure

- **src/client**: Contains the main logic for interacting with social media platforms.
- **src/config**: Configuration files, including the logger setup.
- **src/utils**: Utility functions for handling errors, cookies, etc.
- **src/schema**: Schema definitions for AI-generated content.

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

---

