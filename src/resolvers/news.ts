import makeError from "make-error";
import GoogleNewsRss, { Article } from "google-news-rss";

import { getFormattedDate } from "@/helpers/dates";
import { DEFAULT_NUM_OF_ARTICLES } from "@/constants/configuration";

const googleNews = new GoogleNewsRss();

const NewsArticlesResolverError = makeError("NewsArticlesResolverError");

const finalizeTopic = (topic: string): string =>
    topic === "Информационная безопасность"
        ? "Военная информационная безопасность России"
        : `${topic} России`;

export default async function resolveNewsArticles(
    topic: string,
    numOfArticles = DEFAULT_NUM_OF_ARTICLES,
): Promise<Article[]> {
    let rawArticles;

    try {
        rawArticles = await googleNews.search(
            finalizeTopic(topic),
            numOfArticles,
            "ru",
        );
    } catch (e) {
        throw new NewsArticlesResolverError(
            "Error occurred in resolveNewsArticles resolver",
        );
    }

    return rawArticles.slice(0, numOfArticles).map(
        (article: Article): Article => {
            article.pubDate = getFormattedDate(new Date(article.pubDate));
            return article;
        },
    );
}
