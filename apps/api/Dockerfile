# use the official Bun image
FROM oven/bun:1.2 AS base
WORKDIR /app

# install dependencies
FROM base AS install
COPY package.json ./
RUN bun install

# copy source code
FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

# set production environment
ENV NODE_ENV=production

# run the app
USER bun
EXPOSE 3001/tcp
CMD ["bun", "run", "src/index.ts"]


