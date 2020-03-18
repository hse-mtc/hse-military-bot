import { Extra, Markup, SceneContextMessageUpdate } from "telegraf";

import { NEWS_SCENARIO } from "@/constants/scenarios";
import { GENERAL_CONTROLS } from "@/constants/controls";
import {
    DEFAULT_NUM_OF_ARTICLES,
    NEWS_TOPICS,
} from "@/constants/configuration";

import resolveNewsArticles from "@/resolvers/news";

import track from "@/resolvers/metricaTrack";
import createScene from "@/helpers/createScene";
import { ensureFromIdAndMessageText } from "@/helpers/scenes";

const enterHandler = ({ reply }: SceneContextMessageUpdate) => {
    const controls = [...NEWS_TOPICS, GENERAL_CONTROLS.menu];
    const markup = Extra.markup(({ resize }: Markup) =>
        resize().keyboard(controls),
    );

    return reply("Выберите тему для проведения информирования", markup);
};

const messageHandler = async ({
    from,
    message,
    reply,
}: SceneContextMessageUpdate) => {
    const [fromId, messageText] = await ensureFromIdAndMessageText(
        from,
        message,
        reply,
    );

    if (messageText in NEWS_TOPICS) {
        track(fromId, messageText, "Выбрана тема для информирования");

        const articles = await resolveNewsArticles(
            messageText,
            DEFAULT_NUM_OF_ARTICLES,
        );

        // TODO: how to send several messages?
        for (const article of articles) {
            await reply(article);
        }
        return;
    } else {
        return reply("Выберите существующую тему, или вернитесь в меню");
    }
};

export default () =>
    createScene({
        name: NEWS_SCENARIO.NEWS_SCENE,
        enterHandler,
        messageHandler,
    });
