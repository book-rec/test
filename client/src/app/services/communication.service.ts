/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    basicGet(): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}/example`).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    basicPost(message: Message): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/example/send`, message).pipe(catchError(this.handleError<void>('basicPost')));
    }

    getDestinationLink(sourcelink: string): Observable<string> {
        const linkId = sourcelink.split('/')[-1];
        return this.http.get<string>(`${this.baseUrl}/link/` + linkId).pipe(catchError(this.handleError<string>('getDestinationLink')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
