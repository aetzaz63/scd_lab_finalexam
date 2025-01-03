# Use Node.js base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY src/ ./src

# Expose the port (change the port for each service)
EXPOSE 5000

# Define the command to run the app
CMD ["node", "src/app.js"]
