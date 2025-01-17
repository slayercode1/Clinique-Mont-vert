ARG NODE_VERSION=22.11.0

FROM node:${NODE_VERSION}-alpine

# Set working directory
WORKDIR /usr/src/app/cmv-backend

# Copy package files
COPY ./package*.json ./

# Install dependencies including dev dependencies
RUN npm install --include=dev

# Copy the rest of the source files into the image
COPY . .

# Generate Prisma client before switching users
RUN npx prisma generate

# Expose the port that the application listens on
EXPOSE 3000

# Run the application
CMD npm start
