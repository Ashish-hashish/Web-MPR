FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source files
COPY . .

# Ensure uploads directory exists
RUN mkdir -p /app/uploads

EXPOSE 5000

CMD ["node", "server.js"]
