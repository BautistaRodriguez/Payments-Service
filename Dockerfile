FROM node:14.16.1

WORKDIR /root
ADD src/ src/
COPY package*.json hardhat.config.ts tsconfig.json .env heroku-entrypoint.sh ./
ADD deployments/ deployments/

# Install all dependencies
RUN npm i
RUN cd -

EXPOSE 5000

# Run entry point
CMD ["bash", "heroku-entrypoint.sh"]