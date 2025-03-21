FROM node:lts

# install git
RUN apt update -y && apt upgrade -y && apt install git -y

ARG GL_TOKEN
RUN git config --global url."https://git-push-pull:${GL_TOKEN}@gitlab.reclaimprotocol.org".insteadOf "https://gitlab.reclaimprotocol.org"

# Create app directory and set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
RUN mkdir -p src/scripts
RUN echo '' > src/scripts/prepare.sh

# Install dependencies
RUN npm i

# Download ZK files in a separate layer before copying source
RUN npm run download:zk-files

# Copy source code
COPY . .

# Build the application
RUN npm run build
RUN npm run build:browser
RUN npm prune --production

CMD ["npm", "run", "start"]
EXPOSE 8001