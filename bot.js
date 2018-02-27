const config = {
	node_env: 				process.env.NODE_ENV,
	heroku_url: 			process.env.HEROKU_URL 			|| '',
	firebase_users_url: 	process.env.FIREBASE_USERS_URL  || '',
	port: 					process.env.PORT 				|| 3000,
	token: 					process.env.TOKEN 				|| '',
	std_num_of_articles: 	5
};

const Telegraf = require('telegraf');
const bot = new Telegraf(config.token, {username: 'hse_military_bot'});

const Stage = require('telegraf/stage');
const { enter, leave } = Stage;
const stage = new Stage();

const GoogleNewsRss = require('google-news-rss');
const googleNews = new GoogleNewsRss();

const Markup = require('telegraf/markup');
const Extra = require('telegraf/extra');
const Scene = require('telegraf/scenes/base');
const session = require('telegraf/session');

const Firebase = require('firebase-admin');
const SecreteUsers = require("./secrete/secreteUsers.json");
const firebaseUsers = Firebase.initializeApp({
	credential: Firebase.credential.cert(SecreteUsers),
	databaseURL: config.firebase_users_url
});

const Schedule = require('./schedule');

const newsTopics = ['ВКС', 'Разведка', 'РВСН', 'Внутренняя политика', 'Внешняя политика', 'Военные технологии'];
const platoonTypes = ['Офицеры РВСН', 'Офицеры разведки', 'Офицеры ВКС', 'Сержанты МСВ', 'Солдаты разведки'];
const platoons = [
['1601', '1701', '1702', '1501', '1502'],
['1602', '1603', '1604', '1703', '1704', '1705', '1503', '1504', '1505'],
['1605', '1606', '1706', '1707', '1708', '1506', '1507'],
['1607', '1608', '1609', '1610', '1709', '1710', '1711', '1712'],
['1616', '1617', '1618', '1713']
];
const dates = [
['10 января', '17 января', '24 января', '31 января', '7 февраля', '14 февраля', '21 февраля', '28 февраля', '7 марта', '14 марта', '21 марта', '4 апреля', '11 апреля', '18 апреля', '25 апреля'],
['11 января', '18 января', '25 января', '1 февраля', '8 февраля', '15 февраля', '22 февраля', '1 марта', '15 марта', '22 марта', '5 апреля', '12 апреля', '19 апреля', '26 апреля'],
['12 января', '19 января', '26 января', '2 февраля', '9 февраля', '16 февраля', '2 марта', '16 марта', '23 марта', '6 апреля', '13 апреля', '20 апреля', '27 апреля']
];
const menuButtons = {
	scheduleDefault: 'Расписание для своего взвода',
	schedule: 'Общее расписание',
	news: 'Новости',
	stickers: 'Стикерпак',
	settings: 'Настройки'
};
const menuControls = {
	back: 'Назад',
	menu: 'В меню'
};
const settings = {
	defaultPlatoon: 'Выбрать свой взвод'
};

/* Menu scene */

const menuScene = new Scene('menu')
menuScene.enter(async (ctx) => {
	let defaultPlatoon = await readUserSelection(ctx.from.id, 'defaultPlatoon');

	return ctx.reply('Выберите нужный пункт меню', Extra.markup((markup) => {
		return markup.resize()
		.keyboard(Object.keys(menuButtons).filter((key) => {
			if (!defaultPlatoon && key == 'scheduleDefault') {
				return;
			} else {
				return menuButtons[key];
			}
		}).map((key) => {
			return [menuButtons[key]];
		}));
	}));
});
menuScene.hears(menuButtons.scheduleDefault, enter('scheduleDefaultDate'));
menuScene.hears(menuButtons.schedule, enter('scheduleType'));
menuScene.hears(menuButtons.news, enter('news'));
menuScene.hears(menuButtons.stickers, (ctx) => {
	ctx.replyWithSticker('CAADAgADGQADuoh2BvDmu8LdojQmAg', Markup.inlineKeyboard([
		Markup.urlButton('Полный стикерпак', 'https://t.me/addstickers/HseArmy', false)
		]).extra());
});
menuScene.hears(menuButtons.settings, enter('settings'));
stage.register(menuScene);

/* Settings scene */

const settingsScene = new Scene('settings');
settingsScene.enter((ctx) => {
	let settingsArray = Object.keys(settings).map((key) => {
		return settings[key];
	});

	return ctx.reply('Выберите нужный пункт настроек', Extra.markup((markup) => {
		return markup.resize()
		.keyboard(Object.keys(settings).map((key) => {
			return settings[key];
		}).concat(menuControls.menu));
	}));
});
settingsScene.hears(menuControls.menu, enter('menu'));
settingsScene.hears(settings.defaultPlatoon, enter('settingsType'))
settingsScene.on('message', (ctx) => {
	ctx.reply('Выберите существующую настройку, или вернитесь в меню');
});
stage.register(settingsScene);

/* SettingsType scene */

const settingsTypeScene = new Scene('settingsType');
settingsTypeScene.enter((ctx) => {
	return ctx.reply('Выберите цикл', Extra.markup((markup) => {
		return markup.resize()
		.keyboard(platoonTypes.concat(menuControls.menu));
	}));
});
settingsTypeScene.hears(menuControls.menu, enter('menu'));
settingsTypeScene.on('message', async (ctx) => {
	if (isValueInArray(platoonTypes, ctx.message.text)) {
		await writeUserSelection(ctx.from.id, 'platoonType', ctx.message.text).then(() => {
			return ctx.scene.enter('settingsPlatoon');
		})
	} else {
		ctx.reply('Выберите существующий цикл, или вернитесь в меню');
	}
	
});
stage.register(settingsTypeScene);

/* SettingsPlatoon scene */

const settingsPlatoonScene = new Scene('settingsPlatoon');
settingsPlatoonScene.enter((ctx) => {
	return ctx.reply('Выберите нужный взвод', Extra.markup((markup) => {
		return markup.resize()
		.keyboard(platoons[platoonTypes.indexOf(ctx.message.text)].concat(menuControls.menu));
	}));
});
settingsPlatoonScene.hears(menuControls.menu, enter('menu'));
settingsPlatoonScene.on('message', async (ctx) => {
	let platoonType = await readUserSelection(ctx.from.id, 'platoonType');

	if (isValueInArray(platoons[platoonTypes.indexOf(platoonType)], ctx.message.text)) {
		await writeUserSelection(ctx.from.id, 'defaultPlatoon', ctx.message.text).then(() => {
			return ctx.reply('Настройки сохранены').then(() => {
				ctx.scene.enter('menu');
			})
		})
	} else {
		ctx.reply('Выберите существующий взвод, или вернитесь в меню');
	}
});
stage.register(settingsPlatoonScene);

/* ScheduleType scene */

const scheduleTypeScene = new Scene('scheduleType');
scheduleTypeScene.enter((ctx) => {
	return ctx.reply('Выберите цикл', Extra.markup((markup) => {
		return markup.resize()
		.keyboard(platoonTypes.concat(menuControls.menu));
	}));
});
scheduleTypeScene.hears(menuControls.menu, enter('menu'));
scheduleTypeScene.on('message', async (ctx) => {
	if (isValueInArray(platoonTypes, ctx.message.text)) {
		await writeUserSelection(ctx.from.id, 'platoonType', ctx.message.text).then(() => {
			return ctx.scene.enter('schedulePlatoon');
		})
	} else {
		ctx.reply('Выберите существующий цикл, или вернитесь в меню');
	}
	
});
stage.register(scheduleTypeScene);

/* SchedulePlatoon scene */

const schedulePlatoonScene = new Scene('schedulePlatoon');
schedulePlatoonScene.enter(async (ctx) => {
	return ctx.reply('Выберите взвод', Extra.markup((markup) => {
		return markup.resize()
		.keyboard(platoons[platoonTypes.indexOf(ctx.message.text)].concat(menuControls.menu));
	}))
});
schedulePlatoonScene.hears(menuControls.menu, enter('menu'));
schedulePlatoonScene.on('message', async (ctx) => {
	let platoonType = await readUserSelection(ctx.from.id, 'platoonType');

	if (isValueInArray(platoons[platoonTypes.indexOf(platoonType)], ctx.message.text)) {
		await writeUserSelection(ctx.from.id, 'platoon', ctx.message.text).then(() => {
			return ctx.scene.enter('scheduleDate');
		})
	} else {
		ctx.reply('Выберите существующий взвод, или вернитесь в меню');
	}
});
stage.register(schedulePlatoonScene);

/* ScheduleDate scene */

const scheduleDateScene = new Scene('scheduleDate');
scheduleDateScene.enter(async (ctx) => {
	let platoon = await readUserSelection(ctx.from.id, 'platoon');
	return ctx.reply('Выберите дату', Extra.markup((markup) => {
		let year = platoon.split('')[0] + platoon.split('')[1];
		let key = () => {
			if (year == 16) { return 0; }
			else if (year == 17) { return 1; }
			else if (year == 15) { return 2; }
		};
		return markup.resize()
		.keyboard(dates[key()].concat(menuControls.menu));
	}))
});
scheduleDateScene.hears(menuControls.menu, enter('menu'));
scheduleDateScene.on('message', async (ctx) => {
	let platoon = await readUserSelection(ctx.from.id, 'platoon');
	let year = platoon.split('')[0] + platoon.split('')[1];
	let key = () => {
		if (year == 16) { return 0; }
		else if (year == 17) { return 1; }
		else if (year == 15) { return 2; }
	};

	if (!isValueInArray(dates[key()], ctx.message.text)) {
		return ctx.reply('Выберите существующую дату, или вернитесь в меню');
	};

	await Schedule(platoon, ctx.message.text).then(async (schedule) => {
		let scheduleStringified = null;
		schedule.forEach(async (item) => {
			if(!item.meta) {
					// str.replace(/ {1,}/g," ") for removing long spaces
					if(!scheduleStringified) {
						scheduleStringified = item.time.replace(/\r\n/g, ' ') + " - " + item.lesson.replace(/\r\n/g, ' ') + '\n';
					} else {
						scheduleStringified += item.time.replace(/\r\n/g, ' ') + " - " + item.lesson.replace(/\r\n/g, ' ') + '\n';
					}
				} else {
					scheduleStringified = item.meta + '\n\n';
				}
			});
		return ctx.reply(scheduleStringified);
	}).then(() => {
		return ctx.scene.enter('menu');
	})
});
stage.register(scheduleDateScene);

/* ScheduleDefaultDate scene */

const scheduleDefaultDateScene = new Scene('scheduleDefaultDate');
scheduleDefaultDateScene.enter(async (ctx) => {
	let platoon = await readUserSelection(ctx.from.id, 'defaultPlatoon');

	return ctx.reply(`Ваш взвод: ${platoon}`).then(() => {
		ctx.reply('Выберите дату', Extra.markup((markup) => {
			let year = platoon.split('')[0] + platoon.split('')[1];
			let key = () => {
				if (year == 16) { return 0; }
				else if (year == 17) { return 1; }
				else if (year == 15) { return 2; }
			};
			return markup.resize()
			.keyboard(dates[key()].concat(menuControls.menu));
		}))
	})
});
scheduleDefaultDateScene.hears(menuControls.menu, enter('menu'));
scheduleDefaultDateScene.on('message', async (ctx) => {
	let platoon = await readUserSelection(ctx.from.id, 'defaultPlatoon');
	let year = platoon.split('')[0] + platoon.split('')[1];
	let key = () => {
		if (year == 16) { return 0; }
		else if (year == 17) { return 1; }
		else if (year == 15) { return 2; }
	};

	if (!isValueInArray(dates[key()], ctx.message.text)) {
		return ctx.reply('Выберите существующую дату, или вернитесь в меню');
	};

	await Schedule(platoon, ctx.message.text).then(async (schedule) => {
		let scheduleStringified = null;
		schedule.forEach(async (item) => {
			if(!item.meta) {
					// str.replace(/ {1,}/g," ") for removing long spaces
					if(!scheduleStringified) {
						scheduleStringified = item.time.replace(/\r\n/g, ' ') + " - " + item.lesson.replace(/\r\n/g, ' ') + '\n';
					} else {
						scheduleStringified += item.time.replace(/\r\n/g, ' ') + " - " + item.lesson.replace(/\r\n/g, ' ') + '\n';
					}
				} else {
					scheduleStringified = item.meta + '\n\n';
				}
			});
		return ctx.reply(scheduleStringified);
	}).then(() => {
		return ctx.scene.enter('menu');
	})
});
stage.register(scheduleDefaultDateScene);

/* News scene */

const newsScene = new Scene('news');
newsScene.enter((ctx) => {
	return ctx.reply('Выберите тему новостей', Extra.markup((markup) => {
		return markup.resize()
		.keyboard(newsTopics.concat(menuControls.menu));
	}))
})
newsScene.hears(menuControls.menu, enter('menu'));
newsScene.on('message', async (ctx) => {
	if (isValueInArray(newsTopics, ctx.message.text)) {
		let articles = await getNewsArticles(ctx.message.text);
		articles.forEach((article) => {
			ctx.reply(article);
		});
	} else {
		ctx.reply('Выберите существующую тему, или вернитесь в меню');
	}
})
stage.register(newsScene);

/* Main listeners */

bot.use(session());
bot.use(stage.middleware());

bot.command('help', (ctx) => ctx.reply('Навигация в боте производится с помощью меню.'));
bot.hears(menuButtons.scheduleDefault, enter('scheduleDefaultDate'));
bot.hears(menuButtons.schedule, enter('scheduleType'));
bot.hears(menuButtons.news, enter('news'));
bot.hears(menuButtons.stickers, (ctx) => {
	ctx.replyWithSticker('CAADAgADGQADuoh2BvDmu8LdojQmAg', Markup.inlineKeyboard([
		Markup.urlButton('Полный стикерпак', 'https://t.me/addstickers/HseArmy', false)
		]).extra());
});
bot.hears(menuButtons.settings, enter('settings'));
bot.on('message', enter('menu'));

module.exports = bot;

/* Helpers */

const months = ['января', 'февраля', 'марта', 'апреля','мая', 'июня', 'июля', 'августа','сентября', 'октября', 'ноября', 'декабря'];

function getFormattedDate(dateObj) {
	return	dateObj.getDate() + ' ' 
	+ months[dateObj.getMonth()] + ' ' 
	+ dateObj.getFullYear() + ', '
	+ dateObj.getHours() + ':'
	+ (dateObj.getMinutes().toString().length === 1 ? '0' + dateObj.getMinutes() : dateObj.getMinutes())
};

function isValueInObject(obj, value) {
	for (key in obj) {
		if (obj[key] == value) {
			return true;
		}
	}
	return false;
};

function isValueInArray(arr, value) {
	if (arr.indexOf(value) != -1) {
		return true;
	} else {
		return false;
	}
}

async function getNewsArticles(topic) {
	let articlesFinal = [];
	let numOfArticles = config.std_num_of_articles;

	let articles = await googleNews.search(topic + ' РФ', numOfArticles, 'ru');

	for (let i = 0; i < numOfArticles; i++) {
		let dateObj = new Date(articles[i].pubDate);
		articlesFinal.push(articles[i].title + '\n\n' + articles[i].link + '\n\n' + getFormattedDate(dateObj));
	};

	return articlesFinal;
};

async function writeUserSelection(chatId, field, value) {
	try {
		await firebaseUsers.database().ref(`/users/${chatId}/${field}`).set(value);
	} catch (err) {
		return null
	}
};

async function readUserSelection(chatId, field) {
	try {
		return await firebaseUsers.database().ref(`/users/${chatId}`).once('value').then((data) => {
			return platoonFinal = data.val()[field];
		});
	} catch (err) {
		return null;
	}
};
