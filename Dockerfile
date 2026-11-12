FROM node:24-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# drizzle.config.ts exige un .env ; les variables réelles viennent de l'environnement
RUN touch .env

# Le build prérend des pages qui lisent la base : DATABASE_URL doit être joignable (network: host)
FROM deps AS build
ARG DATABASE_URL
ARG SESSION_SECRET
RUN pnpm build

FROM base AS run
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
