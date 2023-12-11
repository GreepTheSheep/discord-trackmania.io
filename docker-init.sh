#!/bin/bash

docker pull node:lts
docker run --name "tmio-bot-install" -w "/home/node/app" -v "./:/home/node/app" node:lts npm install > /dev/null
docker rm "tmio-bot-install" > /dev/null

echo "First step of init complete"