require("dotenv").config();

const bot = require('./scripts/bot');
require('./server')(bot);
