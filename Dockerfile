# Single-stage build for React frontend (for AWS Amplify deployment)
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# The dist folder will contain the built application for AWS Amplify
# No web server needed as AWS Amplify handles serving static files
