FROM node:14.16.1

WORKDIR /root
ADD src/ src/
COPY package*.json hardhat.config.ts tsconfig.json .env ./
ADD deployments/ deployments/

# Install all dependencies
RUN npm i
RUN cd -

EXPOSE $PORT

# Run entry point
CMD ["npm", "start"]
