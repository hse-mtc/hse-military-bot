import { TArticle } from "google-news-rss";
import { Message } from "telegraf/typings/telegram-types";
import { Extra, Markup, SceneContextMessageUpdate } from "telegraf";

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
import { TReplyOrChangeScene } from "@/typings/custom";

const ARTICLES_DELIMETER = "*********************";

const buildArticlesResponse = (articles: TArticle[]): string => {
    return articles.reduce(
        (response, { title, link, pubDate }) =>
            `\n\n${response}
            \n${pubDate}
            \n${title}
            \n${link}
            \n\n${ARTICLES_DELIMETER}`,
        ARTICLES_DELIMETER,
    );
};

const enterHandler = ({
    reply,
}: SceneContextMessageUpdate): Promise<Message> => {
    const controls = [
        ...makeKeyboardColumns(NEWS_TOPICS, 2),
        [GENERAL_CONTROLS.MENU],
    ];
    const markup = Extra.markup(Markup.keyboard(controls));

    return reply("Выберите тему для проведения информирования", markup);
};

const messageHandler = async ({
    from,
    message,
    reply,
}: SceneContextMessageUpdate): Promise<TReplyOrChangeScene> => {
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
        reply(buildArticlesResponse(articles));

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
