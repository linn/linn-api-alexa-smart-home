FROM node:fermium AS build
COPY . /repo
WORKDIR /repo
RUN npm install
RUN npm run build
RUN npm test

FROM node:fermium-alpine AS production
COPY --from=build /repo/lib/js /app/lib/js
COPY package.json /app
WORKDIR /app
RUN npm install --production

FROM node:fermium-alpine
COPY --from=production /app /app
COPY serverless.yml /app
WORKDIR /app
RUN npm install -g serverless
ENTRYPOINT [ "serverless" ]
CMD [ "deploy", "--force" ]