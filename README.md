
# Discord Lists Companion Webapp

A web application to manage lists of ideas, games, books, movies, and TV shows with Discord authentication.

## Setup

### Backend

1. Clone the repository
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the `backend` directory with the following content:
   ```
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   SESSION_SECRET=your_session_secret
   ```
   - Replace `your_discord_client_id` with your Discord client ID.
   - Replace `your_discord_client_secret` with your Discord client secret.
   - Replace `your_session_secret` with a long, random string for session security.
5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm start
   ```

## Usage

- Open `http://localhost:3000` in your browser.
- Log in with your Discord account.
- Manage your lists of ideas, games, books, movies, and TV shows.

## Credits

- Project created by Garrett Giordano.
- Assisted by [ChatGPT](https://openai.com/chatgpt) from OpenAI for technical guidance and code examples.
