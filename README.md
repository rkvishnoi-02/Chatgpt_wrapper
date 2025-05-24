# LLM Wrapper

This project is a Next.js application that provides a wrapper around Large Language Model (LLM) APIs, allowing users to interact with different LLMs through a unified chat interface.

## Features

*   **Chat Interface:** Provides a user-friendly chat interface for interacting with LLMs.
*   **LLM Provider Agnostic:** Designed to potentially support multiple LLM providers. (Currently uses Google Generative AI).
*   **Themeable:** Includes light and dark mode themes.
*   **Responsive Design:** Adapts to different screen sizes.
*   **Markdown Support:** Renders chat messages with markdown formatting.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/llm-wrapper.git
    cd llm-wrapper
    ```
    *(Replace `your-username/llm-wrapper.git` with the actual repository URL if different)*

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

3.  **Set up environment variables:**
    Duplicate the `.env.local.example` file and rename it to `.env.local`.
    ```bash
    cp .env.local.example .env.local
    ```
    Update `.env.local` with your API keys and other necessary configurations. You will need to add your Google Generative AI API key.

4.  **Run the development server:**
    Using npm:
    ```bash
    npm run dev
    ```
    Or using yarn:
    ```bash
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

Once the development server is running:

1.  Open your browser and navigate to `http://localhost:3000`.
2.  You should see the chat interface.
3.  Type your messages in the input field and press Enter or click the send button to interact with the LLM.
4.  Explore different settings or themes if available.

## Available Scripts

In the project directory, you can run the following commands:

*   `npm run dev` or `yarn dev`
    *   Runs the app in development mode.
    *   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
    *   The page will reload if you make edits.

*   `npm run build` or `yarn build`
    *   Builds the app for production to the `.next` folder.
    *   It correctly bundles React in production mode and optimizes the build for the best performance.

*   `npm run start` or `yarn start`
    *   Starts the production server.
    *   You need to run `npm run build` (or `yarn build`) before this.

*   `npm run lint` or `yarn lint`
    *   Lints the codebase using Next.js's built-in ESLint configuration.

*   `npm run test` or `yarn test`
    *   Launches the test runner in interactive watch mode. (Assumes Jest is configured, as seen in `package.json`)

## Technologies Used

*   **Next.js:** React framework for server-side rendering and static site generation.
*   **React:** JavaScript library for building user interfaces.
*   **TypeScript:** Typed superset of JavaScript.
*   **Tailwind CSS:** Utility-first CSS framework.
*   **Zustand:** Small, fast, and scalable state management solution.
*   **Google Generative AI:** Used for LLM integration.
*   **Axios:** Promise-based HTTP client for making API requests.
*   **React Markdown:** Component to render Markdown.
*   **Jest:** JavaScript testing framework.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

Please make sure to run `npm run lint` (or `yarn lint`) and `npm run test` (or `yarn test`) before submitting a pull request.
