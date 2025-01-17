ARG NODE_VERSION=22.11.0

FROM node:${NODE_VERSION}-alpine


WORKDIR /usr/src/app/cmv-web

COPY ./package*.json ./

RUN npm install --include=dev

# Copy the rest of the source files into the image.
COPY . .
