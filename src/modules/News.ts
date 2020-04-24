import { existsSync, readFileSync, writeFileSync } from "fs";
import { TArticle } from "google-news-rss";

import BaseError from "@/modules/BaseError";
import resolveNewsArticles from "@/resolvers/news";
import { resolveNewsFileConfig } from "@/resolvers/config";

const NewsStorageError = BaseError.createErrorGenerator("NewsStorageError");

type TNewsObject = {
    articles: TArticle[];
    totalPages: number;
};

class NewsStorage {
    private _instance: TNewsObject;

    get instanсe(): TNewsObject {
        return this._instance;
    }

    async fromDumpOrBuild(): Promise<void> {
        const { newsPath } = resolveNewsFileConfig();

        // Trying to restore existing parsed News from JSON on disk
        if (existsSync(newsPath)) {
            this._instance = JSON.parse(readFileSync(newsPath, "utf8"));
        } else {
            await this.buildNews(newsPath);
        }
    }

    async buildNews(newsPath: string): Promise<void> {
        try {
            this._instance = await resolveNewsArticles();
            this.dumpNews(this._instance, newsPath);
        } catch (exception) {
            throw NewsStorageError("Cannot build NewsStorage");
        }
    }

    dumpNews(builtNews: TNewsObject, parsedNewsPath: string): void {
        try {
            const jsonString = JSON.stringify(builtNews);
            writeFileSync(parsedNewsPath, jsonString, "utf8");
        } catch (exception) {
            throw NewsStorageError("Cannot dump NewsStorage");
        }
    }
}

export default new NewsStorage();
