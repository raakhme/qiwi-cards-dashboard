#!/bin/bash
git pull
yarn
pm2 delete app
yarn prod