import GoogleNewsRss, { TArticle } from "google-news-rss";

import createError from "@/helpers/createError";
import { getFormattedDate } from "@/helpers/dates";

const googleNews = new GoogleNewsRss();

const NewsArticlesResolverError = createError({
    name: "NewsArticlesResolverError",
    message: "Error occurred in resolveNewsArticles resolver",
});

const finalizeTopic = (topic: string) =>
    topic === "Информационная безопасность"
        ? "Военная информационная безопасность РФ"
        : `${topic} РФ`;

export default async function resolveNewsArticles(
    topic: string,
    numOfArticles: number,
): Promise<string[]> {
    let rawArticles;

    try {
        rawArticles = await googleNews.search(
            finalizeTopic(topic),
            numOfArticles,
            "ru",
        );
    } catch (e) {
        throw new NewsArticlesResolverError();
    }

    const articles = [];

    for (const rawArticle of rawArticles) {
        const { pubDate, title, link } = rawArticle;
        const date = getFormattedDate(new Date(pubDate));

        articles.push(`${title}\n\n${link}\n\n${date}`);
    }

    return articles;
}
