const express = require('express');
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

  app.get('/', (req, res) => {
    res.send('Hello world!');
  });

  app.get('/yandex_08bb7e8e4db3bb07.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'yandex_08bb7e8e4db3bb07.html'));
  });
  
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
};
