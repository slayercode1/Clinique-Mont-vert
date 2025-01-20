ARG NODE_VERSION=22.11.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

WORKDIR /usr/src/app/cmv-web

COPY ./package*.json ./

RUN npm install --include=dev

# Copy the rest of the source files into the image.
COPY . .

RUN npm run build
