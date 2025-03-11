# Use Node.js official image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of the project files
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
