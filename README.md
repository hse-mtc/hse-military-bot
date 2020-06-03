<p align="center">
  <img style="max-width: 40%;" src="public/images/logo.png" alt="HSE Military Bot Icon"/>
</p>

## <img src="public/images/logo.png" width="20"> HSE Military Training Center [bot](https://t.me/hse_military_bot) for schedule

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/mvshmakov/hse-military-bot)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://github.com/mvshmakov/hse-military-bot/blob/master/LICENSE)
[![GitHub release](https://img.shields.io/github/release/mvshmakov/hse-military-bot.svg)](https://github.com/mvshmakov/hse-military-bot/releases/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)
[![Build Status](https://github.com/mvshmakov/hse-military-bot/workflows/PerCommitCI/badge.svg?branch=master)](https://github.com/mvshmakov/hse-military-bot/actions?query=workflow%3APerCommitCI+branch%3Amaster)
[![Coverage Status](https://coveralls.io/repos/github/mvshmakov/hse-military-bot/badge.svg?branch=master)](https://coveralls.io/github/mvshmakov/hse-military-bot?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=mvshmakov/hse-military-bot)](https://dependabot.com)
[![dependencies Status](https://david-dm.org/mvshmakov/hse-military-bot/master/status.svg)](https://david-dm.org/mvshmakov/hse-military-bot/master)
[![devDependencies Status](https://david-dm.org/mvshmakov/hse-military-bot/master/dev-status.svg)](https://david-dm.org/mvshmakov/hse-military-bot/master?type=dev)

[Project website](https://hse-military-bot.herokuapp.com/)
[Documentation](https://mvshmakov.github.io/hse-military-bot/)

Simply access HSE Military Training Center schedule, prepare news for informating comrades and receive full pack of stickers with people you know well.
Stack of technologies used:

-   Awesome [Telegraf](http://telegraf.js.org/) wrapper for [Telegram API](https://core.telegram.org/).
-   [Heroku](https://heroku.com/) PaaS as hosting for app.
-   [Firebase API](https://firebase.google.com/) as database for user preferences and in-app data validation.
-   [exceljs](https://github.com/guyonroche/exceljs) for parsing and generating json-formatted schedule with metadata from \*.xlsx file.
-   [google-news-rss](https://github.com/brh55/google-news-rss) for parsing Google RSS feed.
-   Yandex.Metrica for statistics tracking.

## To run an app on local machine:

##### 1) Run `npm i` to install all dependences.

##### 2) Add an `.env` file in root directory with following fields:

-   `PORT={Port you want to run on(etc. 5000)}`
-   `BOT_TOKEN={Your Telegram token}`
-   `METRICA_TOKEN={Your Yandex AppMetrica token}`
-   `FIREBASE_USERS_URL={Your Firebase_Users URL}`
-   `FIREBASE_USERS_PROJECT_ID={Your Firebase_Users project ID}`
-   `FIREBASE_USERS_CLIENT_EMAIL={Your Firebase_Users client email}`
-   `FIREBASE_USERS_PRIVATE_KEY={Your Firebase_Users private key}`

##### 3) Run `node .` to run the server in Long Polling mode.

## How to deploy an app on Heroku:

##### 1) Create an app on Heroku.

##### 2) Configure local variables by heroku-cli after push:

-   `heroku config:set BOT_TOKEN={Your Telegram token}`
-   `heroku config:set METRICA_TOKEN={Your Yandex AppMetrica token}`
-   `heroku config:set HEROKU_URL={Your Heroku URL}`
-   `heroku config:set FIREBASE_USERS_URL={YourFirebaseUsersURL}`
-   `heroku config:set FIREBASE_USERS_PROJECT_ID={Your Firebase_Users project ID}`
-   `heroku config:set FIREBASE_USERS_CLIENT_EMAIL={Your Firebase_Users client email}`
-   `heroku config:set FIREBASE_USERS_URL={Your Firebase_Users private key}`

##### 3) Commit and push to Heroku:

-   `git add .`
-   `git commit -m "init deploy commit"`
-   `git push heroku master`

##### 4) Scale an app with heroku-cli to run it with Webhook:

-   `heroku login` -> enter your credentials
-   `heroku ps:scale web=1 -a {YourAppName}` -> to start dyno
-   `heroku ps:scale web=0 -a {YourAppName}` -> to shut down dyno

## How to make a contribution:

##### 1) Run `npm run lint` and correct all typos.

##### 2) Push to development branch with:

-   `git add .`
-   `git commit -m "feature/fix commit"`
-   `git push origin HEAD:develop`

##### 3) Create pull request.

## User interface:

<p align="center">
    <img style="width: 80%;" src="docs_assets/gui.png" alt="Graphical User Interface"/>
</p>

## Yandex.Metrica example stats:

<p align="center">
    <img style="max-width: 80%;" src="docs_assets/metrica_1.png" alt="Yandex.Metrica stats 1"/>
    <img style="max-width: 80%;" src="docs_assets/metrica_2.png" alt="Yandex.Metrica stats 2"/>
</p>

## Tests:

https://github.com/oauthjs/express-oauth-server/blob/master/test/integration/index_test.js
https://github.com/oauthjs/express-oauth-server/blob/master/test/unit/index_test.js

TODO:

-   Правильный хендл всех ошибок про асинхронщину (async/await)

Обязательно используем 14 ноду (хипдамп может не собраться)
Разработка из-под впн (vpnbook)
jupyter lab (не notebook)
