FROM node:6-alpine
MAINTAINER "Stephen Furnival" <sfurnival@gmail.com>

RUN mkdir -p /opt/wsbx/
WORKDIR /opt/wsbx/
COPY . /opt/wsbx/
RUN rm -rf node_modules
RUN npm set progress=false
RUN npm install --production

CMD ["node", "app.js"]