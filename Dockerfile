FROM node:10.15.3

RUN useradd --user-group --create-home --shell /bin/false app &&\
  npm install --global npm@6.4.1 &&\
  npm install --global @google/clasp@2.3.0

ENV HOME=/home/app
COPY package.json npm-shrinkwrap.json $HOME/notify/
RUN chown -R app:app $HOME/*
USER app
WORKDIR $HOME/notify
RUN npm install
