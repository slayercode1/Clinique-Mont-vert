ARG NODE_VERSION=22.11.0

FROM node:${NODE_VERSION}-alpine

# Set working directory
WORKDIR /usr/src/app/cmv-backend

# Copy package files
COPY ./package*.json ./

# Install dependencies including dev dependencies
RUN npm install

# Copy the dist folder to the working directory
COPY ./dist ./dist

COPY ./prisma ./prisma

RUN npx prisma generate

# Expose the port that the application listens on
EXPOSE 3000

# Run the application
CMD npm start
