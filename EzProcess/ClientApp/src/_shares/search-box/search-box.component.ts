import { Component, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ezp-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent {
  keyword: string;

  @Input()
  placeholder = 'Search...';

  @Output()
  searchChange = new EventEmitter<string>();

  @ViewChild('searchInput', { static: true })
  searchInput: ElementRef;


  onValueChange(value: any) {
    setTimeout(() => this.searchChange.emit(value));
  }

  clear() {
    this.searchInput.nativeElement.value = '';
    this.onValueChange(this.searchInput.nativeElement.value);
  }
}
