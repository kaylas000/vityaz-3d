FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Build
COPY . .
RUN npm run build

# Runtime
EXPOSE 3001

CMD ["npm", "run", "start:prod"]
