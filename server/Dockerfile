FROM node:16-alpine AS base
EXPOSE 3000

ENV NODE_ENV=production
ENV UPLOAD_DIR=/assets/dictionaries

RUN apk --no-cache add curl

HEALTHCHECK --interval=1m --timeout=3s \
  CMD curl -f "http://127.0.0.1:3000/status" || exit 1

RUN mkdir /assets && chown -R node:node assets

WORKDIR /app
COPY ./server/package*.json ./
COPY ./server/assets ./assets/

RUN npm ci --quiet --only=production

# Changer owner from root to node
RUN chown -R node:node /app

FROM node:16 AS build

WORKDIR /builddir/server
COPY ./server/package*.json ./

RUN npm ci --quiet

COPY . ..

RUN npm run build

FROM base AS final
COPY --chown=node:node --from=build /builddir/server/out ./out
USER node
ENTRYPOINT ["node", "out/server/app/index.js"]

FROM build AS coverage
WORKDIR /builddir/server
ENTRYPOINT ["npm", "run", "coverage"]

FROM build AS lint
ENTRYPOINT ["npm", "run", "lint"]
