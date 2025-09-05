# Use an official Node.js runtime as the base
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Expose the app port
EXPOSE 2026

# Run the app
CMD ["node", "dist/main"]
