FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun build src/index.ts --compile --outfile server

FROM gcr.io/distroless/base
WORKDIR /app
COPY --from=build /app/server .
EXPOSE 3000
CMD ["./server"]
