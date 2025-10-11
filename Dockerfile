FROM node:lts-alpine AS deps
RUN apk add --no-cache pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:lts-alpine AS builder
RUN apk add --no-cache pnpm
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:lts-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 8080

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER node
EXPOSE 8080
CMD ["node", "dist/server.js"]