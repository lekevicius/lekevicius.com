# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22-alpine

### BUILD ######################################################################
FROM node:${NODE_VERSION} AS build
# native/build deps; keep minimal (adjust if you don't need some)
RUN apk add --no-cache build-base git vips-dev autoconf automake zlib-dev libpng-dev
# install pnpm directly (avoid corepack issues)
RUN npm install -g pnpm@10

# install exactly where we will build
WORKDIR /opt/app
# prime layers for caching
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# make local bins (strapi) resolvable during build
ENV PATH=/opt/app/node_modules/.bin:$PATH

# now copy sources and build
COPY . .
RUN pnpm build
RUN CI=true pnpm prune --prod

### RUNTIME ####################################################################
FROM node:${NODE_VERSION}
# runtime libs for sharp
RUN apk add --no-cache vips
ENV NODE_ENV=production

WORKDIR /opt/app
COPY --from=build /opt/app ./

# non-root
RUN chown -R node:node /opt/app
USER node

EXPOSE 1337
# call Strapi directly
CMD ["node_modules/.bin/strapi", "start"]
