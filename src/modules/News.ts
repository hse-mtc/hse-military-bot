import makeError from "make-error";
import { Article } from "google-news-rss";
import { existsSync, readFileSync, writeFileSync } from "fs";

// import resolveNewsArticles from "@/resolvers/news";
import { resolveNewsFileConfigSync } from "@/resolvers/config";

const NewsStorageError = makeError("NewsStorageError");

type NewsObject = {
    articles: Article[];
    totalPages: number;
};

class NewsStorage {
    private _instance: NewsObject;

    get instance(): NewsObject {
        return this._instance;
    }

    async fromDumpOrBuild(): Promise<void> {
        const { newsPath } = resolveNewsFileConfigSync();

        // Trying to restore existing parsed News from JSON on disk
        if (existsSync(newsPath)) {
            this._instance = JSON.parse(readFileSync(newsPath, "utf8"));
        } else {
            await this.buildNews(newsPath);
        }
    }

    async buildNews(newsPath: string): Promise<void> {
        try {
            // TODO: wtf?
            // this._instance = await resolveNewsArticles();
            this.dumpNews(this._instance, newsPath);
        } catch (exception) {
            throw new NewsStorageError("Cannot build NewsStorage");
        }
    }

    dumpNews(builtNews: NewsObject, parsedNewsPath: string): void {
        try {
            const jsonString = JSON.stringify(builtNews);
            writeFileSync(parsedNewsPath, jsonString, "utf8");
        } catch (exception) {
            throw new NewsStorageError("Cannot dump NewsStorage");
        }
    }
}

export default new NewsStorage();
