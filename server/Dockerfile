FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json .
RUN npm install


COPY . .
RUN npx prisma generate


RUN npm run build

RUN mkdir -p src/uploads && chmod 777 src/uploads



CMD ["npm","run","start"]
