# Use Node 18 LTS
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy backend source code
COPY . .

# Cloud Run uses PORT env var
ENV PORT=8080

# Expose the port (not required for Cloud Run, but good practice)
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
