## HSE Military department [bot](https://t.me/hse_military_bot) for schedule.
[![Build Status](https://travis-ci.org/mvshmakov/hse-military-bot.svg?branch=master)](https://travis-ci.org/mvshmakov/hse-military-bot)
Simply access HSE military department schedule, prepare news for informating comrades and receive full pack of stickers with people you know well.
Stack of technologies used: 
* Awesome [Telegraf](http://telegraf.js.org/) wrapper for [Telegram API](https://core.telegram.org/).
* [Heroku](https://heroku.com/) PaaS as hosting for app.
* [Firebase API](https://firebase.google.com/) as database for user preferences and in-app data validation.
* [exceljs](https://github.com/guyonroche/exceljs) for parsing and generating json-formatted schedule with metadata from \*.xlsx file.
* [google-news-rss](https://github.com/brh55/google-news-rss) for parsing Google RSS feed.
* [botanio](http://botan.io/) for Yandex AppMetrica statistics tracking.

## To run an app on local machine:
##### 1) Run `npm i` to install all dependences.
##### 2) Add an `.env` file in root directory with following fields:
* `NODE_ENV=development`
* `PORT={PortYouWantToRun(etc. 5000)}`
* `TOKEN={YourTelegramToken}`
* `METRIKA_TOKEN={YourYandexMetricaToken}`
* `FIREBASE_USERS_URL={YourFirebaseUsersURL}`
##### 3) Add your `secreteUsers.json` with Firebase secrete key content in `secrete/` directory.
##### 4) Run `node .` to run the server in Long Polling mode.

## How to deploy an app on Heroku:
##### 1) Create an app on Heroku.
##### 2) Configure local variables by heroku-cli after push:
* `heroku config:set TOKEN={YourTelegramToken}`
* `heroku config:set METRICA_TOKEN={YourYandexMetricaToken}`
* `heroku config:set HEROKU_URL={YourHerokuUrl}`
* `heroku config:set FIREBASE_USERS_URL={YourFirebaseUsersURL}`
##### 3) Add your `secreteUsers.json` with Firebase secrete key content in `secrete/` directory.
##### 4) Commit and push to Heroku:
* `git add .`
* `git commit -m "init deploy commit"`
* `git push heroku master`
##### 5) Scale an app with heroku-cli to run it with Webhook:
* `heroku login` -> enter your credentials
* `heroku ps:scale web=1 -a {YourAppName}` -> to start dyno
* `heroku ps:scale web=0 -a {YourAppName}` -> to shut down dyno

## How to make a contribution:
##### 1) Run `npm run lint` and correct all typos (`npm run lint:fix` runs eslint with `--fix` flag).
##### 2) Push to development branch with:
* `git add .`
* `git commit -m "feature/fix commit"`
* `git push origin HEAD:develop`
##### 3) Create merge request.
