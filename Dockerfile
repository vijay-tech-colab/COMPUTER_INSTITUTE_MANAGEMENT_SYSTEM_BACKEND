# Use Node.js LTS version
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# Copying package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

RUN npm install --production

# Bundle app source
COPY . .

# Expose the API port
EXPOSE 9000

# Command to run the application
CMD [ "npm", "start" ]
