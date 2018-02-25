require("dotenv").config();

const bot = require('./bot');
require('./server')(bot);
