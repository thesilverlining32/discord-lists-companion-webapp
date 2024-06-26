# Use the official Node.js image as a base
FROM node:20.13.1

# Set the working directory to /usr/src/app
WORKDIR /usr/src/app

# Set NODE_OPTIONS to use legacy OpenSSL providers
ENV NODE_OPTIONS=--openssl-legacy-provider

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

# Set build argument for the frontend build
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

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
