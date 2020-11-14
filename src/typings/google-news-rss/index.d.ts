declare module "google-news-rss" {
    type TArticle = {
        title: string;
        link: string;
        pubDate: string;
        description: string;
        publisher: string;
        imgSrc: string;
    };

    export default class GoogleNewsClient {
        search(
            topic: string,
            numOfArticles: number,
            language: "ru" | "en",
            extraParams?: Record<string, unknown>,
        ): Promise<TArticle[]>;
    }
}
