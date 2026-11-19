FROM node:24-alpine

WORKDIR /app

COPY package.json server.mjs ./
COPY web ./web

ENV HOST=0.0.0.0
ENV PORT=777

EXPOSE 777

CMD ["npm", "start"]
