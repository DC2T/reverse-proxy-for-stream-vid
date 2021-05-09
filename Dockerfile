FROM node:14.15.1
ENV NODE_ENV=${NODE_ENV} 
WORKDIR /usr/src/app
RUN npm install -g npm
COPY "package.json" /usr/src/app
RUN npm install 
COPY . /usr/src/app
EXPOSE 5003
CMD ["npm", "start"]
