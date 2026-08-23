FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run check
# Deployment sources are streamed over an existing release directory. Remove a
# prior build artifact so Next cannot retain an obsolete server chunk.
RUN rm -rf .next && npx next build
FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npx","next","start","-p","3000"]
