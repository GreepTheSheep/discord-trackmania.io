FROM node:lts

WORKDIR /server/tmiodiscord

COPY ./src /server/tmiodiscord/src
COPY ./.env /server/tmiodiscord/.env
COPY ./package.json /server/tmiodiscord/package.json
COPY ./.git /server/tmiodiscord/.git

ENV NPM_CONFIG_LOGLEVEL warn
RUN npm i --production

CMD node /server/tmiodiscord/src/index.js