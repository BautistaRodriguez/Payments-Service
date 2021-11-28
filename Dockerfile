FROM node:14.16.1

# Set a working directory inside container
WORKDIR /app

# Copy entry point and application dependencies inside container
COPY heroku/heroku-entrypoint.sh package*.json ./

# Install all dependencies
RUN npm install
RUN cd -

EXPOSE 5000


COPY src/ ./

# Run entry point
CMD ["bash", "heroku-entrypoint.sh"]
