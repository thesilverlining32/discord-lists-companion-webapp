# Use the official Node.js image as a base
FROM node:14

# Create and set the working directory
WORKDIR /usr/src/app

# Install git
RUN apt-get update && apt-get install -y git

# Clone the repository
RUN git clone https://github.com/thesilverlining32/discord-lists-companion-webapp.git .

# Change to the backend directory
WORKDIR /usr/src/app/backend

# Install app dependencies
COPY package*.json ./
RUN npm install

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
