FROM node:24-alpine

WORKDIR /app

# Enable corepack so pnpm is available
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# Default CMD for API service
CMD ["node", "dist/index.js"]