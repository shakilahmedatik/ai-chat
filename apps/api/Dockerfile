FROM node:24-alpine

WORKDIR /app

# Enable corepack so pnpm is available
RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter forum-backend...

COPY apps/api apps/api

RUN pnpm --filter forum-backend build

# Default CMD for API service
CMD ["node", "apps/api/dist/index.js"]