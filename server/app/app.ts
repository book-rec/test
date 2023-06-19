/* eslint-disable no-bitwise */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpException } from '@app/classes/http.exception';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as logger from 'morgan';
import { Service } from 'typedi';
import * as env from './../../client/src/environments/environment';
import { UrlInfo } from './../../common/urlInfo';
import { ShortenerService } from './shortener.service';

@Service()
export class Application {
    app: express.Application;
    private readonly internalError: number = StatusCodes.INTERNAL_SERVER_ERROR;

    constructor(private shortenerService: ShortenerService) {
        this.app = express();

        this.config();
        this.redirectUrl();

        this.bindRoutes();
    }
    async getInfo(id: string): Promise<UrlInfo[]> {
        return await this.shortenerService.getDestinationURL(id);
    }
    generateUID(): string {
        // I generate the UID from two parts here
        // to ensure the random number provide enough bits.
        const firstPart = (Math.random() * 46656) | 0;
        const secondPart = (Math.random() * 46656) | 0;
        const firstParts = ('000' + firstPart.toString(36)).slice(-3);
        const secondParts = ('000' + secondPart.toString(36)).slice(-3);
        return firstParts + secondParts;
    }

    redirectUrl(): void {
        this.app.get('/short', async (req, res) => {
            const url = req.query.url as string;
            const id = this.generateUID();
            console.log('the ids is', id);
            await this.shortenerService.addNewUrl(url, id);
            res.send(env + `${id}`);
        });

        this.app.get('/:id', async (req, res) => {
            const id = req.params.id as string;

            const url = await this.getInfo(id);

            console.log('urllllll', url);
            if (url) {
                res.redirect(url[0].destinationURL);
            } else {
                res.sendStatus(404);
            }
        });
    }

    bindRoutes(): void {
        // this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));
        // this.app.use('/api/example', this.exampleController.router);
        // this.app.use('/api/date', this.dateController.router);
        /* this.app.use('/', (req, res) => {
            res.redirect('/api/docs');
        });*/
        this.errorHandling();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(logger('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: HttpException = new HttpException('Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
