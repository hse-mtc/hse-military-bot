const express = require('express');
const favicon = require('express-favicon');
const path = require('path');

const app = express();

module.exports = (bot) => {
  if (process.env.NODE_ENV == 'development') {
    bot.telegram.deleteWebhook();
    bot.startPolling();
  } else {
    bot.telegram.setWebhook(`${process.env.HEROKU_URL}/bot${process.env.TOKEN}`);
    app.use(bot.webhookCallback(`/bot${process.env.TOKEN}`));
  }

  app.use(express.static(path.join(__dirname, 'public')));

  app.use(favicon('favicon.ico'));

  app.get('/', (req, res) => {
    res.sendFile('index.html');
  });
  
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
};
