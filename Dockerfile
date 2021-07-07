FROM node:14.15.1 as build
ENV NODE_ENV=production
WORKDIR ./
COPY "package*.json" ./
RUN npm install
COPY . ./
RUN npm run build

EXPOSE 5003
CMD ["npm", "start"]

