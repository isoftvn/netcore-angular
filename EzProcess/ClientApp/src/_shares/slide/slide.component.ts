import { Component } from '@angular/core';
import { Slide } from '@models/slide.model';
import { ShareService } from '@services/share.service';
import { OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';

@Component({
  selector: 'ezp-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss']
})
export class SlideComponent {

  public slideIsLoading: boolean;
  public slides: Slide[] = new Array();
  public customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    autoplay: true,
    navSpeed: 500,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      }
    },
    nav: false
  }

  constructor(private shareService: ShareService) {

  }

  ngOnInit() {
    this.slideIsLoading = true;
    this.shareService.getSlideShow().then(slides => {
      this.slides = slides;
    });
  }

  getImageUrl(slide: Slide) {
    return 'Uploads/carousel/' + slide.image;
  }

  getData(data: SlidesOutputData) {
    setTimeout(() => {
      this.slideIsLoading = false;
    });
  }
}
