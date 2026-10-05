FROM node:20-alpine

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

EXPOSE 5173

# Run Vite dev server with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
