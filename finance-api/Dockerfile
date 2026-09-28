FROM node:22-bookworm-slim AS build

WORKDIR /app

# Prisma's Linux engine needs OpenSSL at build and runtime.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates sqlite3 \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Keep the Prisma CLI available so migrations can be run explicitly before deploy.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./package.json

RUN mkdir -p /data && chown node:node /data
USER node

EXPOSE 3001
CMD ["node", "dist/src/main.js"]
