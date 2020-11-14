import { TArticle } from "google-news-rss";
import { Extra, Markup } from "telegraf";

import { NEWS_SCENARIO } from "@/constants/scenarios";
import { GENERAL_CONTROLS } from "@/constants/controls";
import { NEWS_TOPICS } from "@/constants/configuration";

import track from "@/resolvers/metricaTrack";
import resolveNewsArticles from "@/resolvers/news";

import {
    ensureFromIdAndMessageText,
    makeKeyboardColumns,
} from "@/helpers/scenes";
import createScene from "@/helpers/createScene";
import { SceneHandler } from "@/typings";

const ARTICLES_DELIMITER = "*********************";

const buildArticlesResponse = (articles: TArticle[]): string => {
    return articles.reduce(
        (response, { title, link, pubDate }) =>
            `\n\n${response}
            \n${pubDate}
            \n${title}
            \n${link}
            \n\n${ARTICLES_DELIMITER}`,
        ARTICLES_DELIMITER,
    );
};

const enterHandler: SceneHandler = ({ reply }) => {
    const controls = [
        ...makeKeyboardColumns(NEWS_TOPICS, 2),
        [GENERAL_CONTROLS.MENU],
    ];
    const markup = Extra.markup(Markup.keyboard(controls));

    return reply("Выберите тему для проведения информирования:", markup);
};

const messageHandler: SceneHandler = async ({ from, message, reply }) => {
    const [fromId, messageText] = ensureFromIdAndMessageText(
        from,
        message,
        reply,
    );

    if (NEWS_TOPICS.includes(messageText)) {
        // Without emoji
        const cleanMessageText = messageText.replace(
            /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g,
            "",
        );

        track(fromId, cleanMessageText, "Выбрана тема для информирования");

        const articles = await resolveNewsArticles(cleanMessageText);
        await reply(buildArticlesResponse(articles));

        return reply("На сегодня хватит...");
    } else {
        return reply(
            "Выберите существующую тему, или вернитесь в меню",
            Extra.markup(Markup.resize(true)),
        );
    }
};

export default createScene({
    name: NEWS_SCENARIO.NEWS_SCENE,
    enterHandler,
    messageHandler,
});
