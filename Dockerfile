FROM node:6.9

MAINTAINER J. Scott Smith <scott@newleafsolutionsinc.com>

#
# Following Best Practices and guidelines at:
# 	https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
# 	https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
#

WORKDIR /home/node/app

# Best practice: run with NODE_ENV set to production
ENV NODE_ENV production

# Install dependencies
RUN npm install -g webmodules
COPY package.json /home/node/app
COPY npm-shrinkwrap.json /home/node/app
RUN npm install
RUN wpm install

# Best practice: run as user 'node'
USER node
EXPOSE 8080

# Copy source dist; relies on .dockerignore
# NOTE: Must perform 'npm run build' beforehand
COPY . /home/node/app

# Best practice: bypass the package.json's start
CMD [ "node", "./dist/server/main.js" ]
