FROM node:14.16.1

# Install Heroku GPG dependencies
RUN apt-get install -y gpg apt-transport-https gpg-agent curl ca-certificates

# Set a working directory inside container
WORKDIR /app

# Copy entry point and application dependencies inside container
COPY heroku/heroku-entrypoint.sh package*.json ./

# Install all dependencies
RUN npm install
RUN npm install --save dd-trace
RUN cd -

EXPOSE 5000


COPY app/ ./

# Run entry point
CMD ["bash", "heroku-entrypoint.sh"]
