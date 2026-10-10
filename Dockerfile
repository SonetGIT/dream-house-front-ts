FROM node:22-alpine AS build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive

COPY . .
ARG VITE_API_URL
ARG VITE_REPORTS_URL
ARG VITE_SOCKET_URL=""
ARG VITE_SOCKET_PATH="/socket.io"
ENV VITE_API_URL=$VITE_API_URL \
    VITE_REPORTS_URL=$VITE_REPORTS_URL \
    VITE_SOCKET_URL=$VITE_SOCKET_URL \
    VITE_SOCKET_PATH=$VITE_SOCKET_PATH
RUN test -n "$VITE_API_URL" || (echo "VITE_API_URL is required" >&2; exit 1)
RUN test -n "$VITE_REPORTS_URL" || (echo "VITE_REPORTS_URL is required" >&2; exit 1)
RUN yarn build

FROM nginx:stable-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
