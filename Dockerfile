FROM node:carbon AS build
COPY . /repo
WORKDIR /repo
RUN npm install
RUN npm run build
RUN npm test
