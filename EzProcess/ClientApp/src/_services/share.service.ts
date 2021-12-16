import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Slide } from '../_models/slide.model';

@Injectable()
export class ShareService {

  constructor(private http: HttpClient) { }

  getSlideShow() {
    return this.http.get<any>('assets/slideshow.json')
      .toPromise()
      .then(res => <Slide[]>res.data)
      .then(data => { return data; });
  }
}
