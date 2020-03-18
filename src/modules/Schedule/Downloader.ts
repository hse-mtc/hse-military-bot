import { writeFileSync } from "fs";
import { join } from "path";

import fetch from "node-fetch";
import { Parser } from "htmlparser2";

import Logger from "@/modules/Logger";
import createError from "@/helpers/createError";

class ScheduleDownloader {
    private _baseUrl = "https://www.hse.ru";
    private _scheduleUrl = `${this._baseUrl}/org/hse/ouk/mil/schedule`;
    private _schedulePath = join(__dirname, "../../static/schedule.xlsx");

    public ScheduleDownloaderError = createError({
        name: "ScheduleDownloaderError",
        message: "Cannot download schedule xlsx",
    });

    public ScheduleDownloaderHrefError = createError({
        name: "ScheduleDownloaderHrefError",
        message: "Cannot find href for schedule",
    });

    public ScheduleDownloaderHtmlError = createError({
        name: "ScheduleDownloaderHtmlError",
        message: "Cannot find download html for schedule",
    });

    public async downloadSchedule() {
        const html = await this._getPlainHtml();
        const scheduleHref = await this._parseHtml(html);

        if (scheduleHref === undefined) {
            throw new this.ScheduleDownloaderHrefError();
        }

        await this._downloadAndSaveXlsx(`${this._baseUrl}${scheduleHref}`);
    }

    private async _getPlainHtml(): Promise<string> {
        const response = await fetch(this._scheduleUrl);

        if (!response.ok) {
            throw new this.ScheduleDownloaderHtmlError();
        }

        return response.text();
    }

    private _parseHtml(html: string): Promise<string | void> {
        return new Promise((resolve, reject) => {
            const parser = new Parser(
                {
                    onopentag: (name, attribs) => {
                        if (
                            name === "a" &&
                            attribs.href &&
                            attribs.href.indexOf(".xlsx") !== -1
                        ) {
                            resolve(attribs.href);
                        }
                    },
                },
                { decodeEntities: true },
            );

            parser.write(html);
            parser.end();
        });
    }

    private async _downloadAndSaveXlsx(scheduleHref: string): Promise<void> {
        try {
            const response = await fetch(scheduleHref);
            const xlsxContent = await response.buffer();

            writeFileSync(this._schedulePath, xlsxContent, "utf8");
        } catch (exception) {
            throw new this.ScheduleDownloaderError();
        }
    }
}

export default new ScheduleDownloader();
