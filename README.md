## HSE Military department bot for schedule.


## To run an app on local machine:
##### 1) Run `npm i` to install all dependences.
##### 2) Add an `.env` file with following fields:
* `NODE_ENV=development`
* `PORT={PortYouWantToRun(etc. 5000)}`
* `TOKEN={YourTelegramToken}`
##### 3) Run `node .` to run the server.

## How to deploy an app on Heroku:
##### 1) Configure local variables by heroku-cli after push:
* `heroku config:set TOKEN={YourTelegramToken}`
* `heroku config:set HEROKU_URL=$(heroku info -s | grep web_url | cut -d= -f2)`
##### 2) Commit and push to Heroku:
* `git add *`
* `git commit -m "init deploy commit"`
* `git push heroku master`