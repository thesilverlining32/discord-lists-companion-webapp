# Use the official Node.js image as a base
FROM node:14

# Set the working directory to /usr/src/app
WORKDIR /usr/src/app

# Install git and npm
# RUN apt-get update && apt-get install -y git

# Clone the repository
# RUN git clone https://github.com/thesilverlining32/discord-lists-companion-webapp.git .

# Copy package.json and package-lock.json for both frontend and backend
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for both frontend and backend
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy all the source code
COPY . .

# Build the frontend
RUN cd frontend && npm run build

# Ensure the backend/public directory exists
RUN mkdir -p backend/public

# Move the frontend build to the backend's public directory
RUN mv frontend/build/* backend/public/

# Set the working directory to backend
WORKDIR /usr/src/app/backend

# Expose the port
EXPOSE 3000

# Start the backend server
CMD ["npm", "start"]
