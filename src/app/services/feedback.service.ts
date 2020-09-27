import { Injectable } from '@angular/core';
import { Feedback } from '../shared/feedback';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { ProcessHTTPMsgService } from '../services/process-httpmsg.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private processHTTPMsgService:ProcessHTTPMsgService,
    private http:HttpClient
    ) { }

  postFeedback(feedback:Feedback): Observable<Feedback>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<Feedback>(baseURL + 'feedback/' , feedback, httpOptions)
    .pipe(catchError(this.processHTTPMsgService.handleError));
  }


}
