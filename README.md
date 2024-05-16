
# Discord Lists Companion Webapp

A web application to manage lists of ideas, games, books, movies, and TV shows with Discord authentication.

## Setup

### Backend

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd /path/to/your/project
   ```
3. Copy the example Docker Compose file and update the environment variables:
   ```bash
   cp docker-compose.example.yml docker-compose.yml
   ```
4. Edit `docker-compose.yml` and replace the placeholder values with your actual credentials:
   ```yaml
   environment:
     DISCORD_CLIENT_ID: your_discord_client_id
     DISCORD_CLIENT_SECRET: your_discord_client_secret
     SESSION_SECRET: your_session_secret
     MONGODB_URI: mongodb://mongo:27017/my-list-app
	 REACT_APP_BACKEND_URL: http://localhost:3000
   ```

### Running the Application

1. Build the Docker images:
   ```bash
   docker-compose build
   ```

2. Start the containers:
   ```bash
   docker-compose up
   ```

3. To stop the containers:
   ```bash
   docker-compose down
   ```

## Credits

- Project created by Garrett Giordano.
- Assisted by [ChatGPT](https://openai.com/chatgpt) from OpenAI for technical guidance and code examples.
