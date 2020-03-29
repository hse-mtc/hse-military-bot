import GoogleNewsRss from "google-news-rss";

import BaseError from "@/modules/BaseError";
import { getFormattedDate } from "@/helpers/dates";

const googleNews = new GoogleNewsRss();

const NewsArticlesResolverError = BaseError.createErrorGenerator(
    "NewsArticlesResolverError",
);

const finalizeTopic = (topic: string): string =>
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
        throw NewsArticlesResolverError(
            "Error occurred in resolveNewsArticles resolver",
        );
    }

    const articles = [];

    for (const rawArticle of rawArticles) {
        const { pubDate, title, link } = rawArticle;
        const date = getFormattedDate(new Date(pubDate));

        articles.push(`${title}\n\n${link}\n\n${date}`);
    }

    return articles;
}
