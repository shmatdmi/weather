FROM node:24-alpine

WORKDIR /app

COPY package.json server.mjs ./
COPY web ./web

ENV HOST=0.0.0.0
ENV PORT=797

EXPOSE 797

CMD ["npm", "start"]
