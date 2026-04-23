FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code (NOT .env — injected at runtime via env_file)
COPY . .

# Ensure .env files are NOT baked into the image
# (they are excluded via .dockerignore)

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]
