import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export const SkipInterceptor: string = 'X-Skip-Interceptor';
export const WriteObject: string = 'X-Write-Object';

@Injectable()
export class BackendInterceptor implements HttpInterceptor {

    constructor() {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        
        if (request.headers.has(SkipInterceptor)) {
            const headers: HttpHeaders = request.headers.delete(SkipInterceptor);
            return next.handle(request.clone({headers}));
        }

        if (request.headers.has(WriteObject)) {
            const headers: HttpHeaders = request.headers.delete(WriteObject);
            const updatedRequest: HttpRequest<unknown> = request.clone({
                setParams: {
                    consumer_key: environment.writableKeys.consumer_key,
                    consumer_secret: environment.writableKeys.consumer_secret
                },
                headers
            });

            return next.handle(updatedRequest);
        }

        const modifiedRequest: HttpRequest<unknown> = request.clone({
            setParams: {
                consumer_key: environment.writableKeys.consumer_key,
                consumer_secret: environment.writableKeys.consumer_secret
            }
        });

        return next.handle(modifiedRequest);
    }
}