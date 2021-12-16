import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsTag } from '@models/news-tag.model';
import { Permission } from '@models/permission.model';
import { AccountService } from '@services/account.service';

@Component({
  selector: 'ezp-post-article',
  templateUrl: './post-article.component.html',
  styleUrls: ['./post-article.component.scss']
})
export class PostArticleComponent implements OnInit {

  @Output()
  closeEvent: EventEmitter<boolean> = new EventEmitter();

  public form: FormGroup;
  public validated = false;
  public isSaving: boolean = false;
  isEdit: boolean = false;
  get f() { return this.form.controls; }
  tags: NewsTag[] = [];

  constructor(private accountService: AccountService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['']
    })
  }

  config: any = {
    airMode: false,
    tabDisable: true,
    height: '380px',
    uploadImagePath: '/api/file/upload',
    popover: {
      table: [
        ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
        ['delete', ['deleteRow', 'deleteCol', 'deleteTable']]
      ],
      image: [
        ['image', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeNone']],
        ['float', ['floatLeft', 'floatRight', 'floatNone']],
        ['remove', ['removeMedia']]
      ],
      link: [['link', ['linkDialogShow', 'unlink']]],
      air: [
        [
          'font',
          [
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'superscript',
            'subscript',
            'clear'
          ]
        ]
      ]
    },
    toolbar: [
      ['misc', ['codeview', 'undo', 'redo', 'codeBlock']],
      [
        'font',
        [
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'superscript',
          'subscript',
          'clear'
        ]
      ],
      ['fontsize', ['fontname', 'fontsize', 'color']],
      ['para', ['style0', 'ul', 'ol', 'paragraph', 'height']],
      ['insert', ['table', 'picture', 'link', 'video', 'hr']]
    ],
    codeviewFilter: true,
    codeviewFilterRegex: /<\/*(?:applet|b(?:ase|gsound|link)|embed|frame(?:set)?|ilayer|l(?:ayer|ink)|meta|object|s(?:cript|tyle)|t(?:itle|extarea)|xml|.*onmouseover)[^>]*?>/gi,
    codeviewIframeFilter: true
  };

  onSubmit() {
    this.validated = true;
    if (this.form.invalid) {
      return;
    }
  }

  cancel() {
    this.validated = false;
    this.closeEvent.emit();
  }

  get canPostArticle() {
    return this.accountService.userHasPermission(Permission.postArticlePermission);
  }
}
