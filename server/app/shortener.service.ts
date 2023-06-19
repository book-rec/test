/* eslint-disable no-console */
import { Service } from 'typedi';
import { UrlInfo } from './../../common/urlInfo';
import { DatabaseService } from './database.service';
@Service()
export class ShortenerService {
    constructor(public databaseService: DatabaseService) {}

    async getDestinationURL(sourceUrl: string): Promise<UrlInfo[]> {
        console.log('getting');
        return await this.databaseService.database.collection<UrlInfo>('url').find({ source: sourceUrl }).toArray();
    }
    async addNewUrl(destinationURL: string, source: string) {
        const urlInfo: UrlInfo = {
            source,
            destinationURL,
            date: new Date(),
        };
        console.log('adding', urlInfo);
        return await this.databaseService.database.collection<UrlInfo>('url').insertOne(urlInfo);
    }
}
