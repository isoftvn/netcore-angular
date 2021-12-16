import { Injectable } from '@angular/core';
import { HttpResponseBase } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Utilities } from '@helpers/utilities';

@Injectable()
export class AlertService {

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {

  }

  showMessage(summary: string);
  showMessage(summary: string, detail: string, severity: MessageSeverity);
  showMessage(summaryAndDetails: string[], summaryAndDetailsSeparator: string, severity: MessageSeverity);
  showMessage(response: HttpResponseBase, ignoreValue_useNull: string, severity: MessageSeverity);
  showMessage(data: any, separatorOrDetail?: string, severity?: MessageSeverity) {

    if (!severity) {
      severity = MessageSeverity.info;
    }

    if (data instanceof HttpResponseBase) {
      data = Utilities.getHttpResponseMessages(data);
      separatorOrDetail = Utilities.captionAndMessageSeparator;
    }

    if (data instanceof Array) {
      for (const message of data) {
        const msgObject = Utilities.splitInTwo(message, separatorOrDetail ?? '');

        this.messageService.add({ severity: severity, summary: msgObject.firstPart, detail: msgObject.secondPart });
      }
    } else {
      this.messageService.add({ severity: severity, summary: data, detail: separatorOrDetail ?? '' });
    }
  }

  startStickyMessage(caption = '', message = 'Loading...', severity = MessageSeverity.info) {
    this.messageService.add({ sticky: true, severity, summary: caption, detail: message });
  }

  stopStickyMessage() {
    this.messageService.clear();
  }

  showConfirm(event: Event, message: string, okCallback: (val?: any) => any, rejectCallback: (val?: any) => any) {
    this.confirmationService.confirm({
      target: event.target ?? undefined,
      message: message,
      icon: 'fas fa-exclamation-triangle text-warning',
      accept: okCallback,
      reject: rejectCallback
    });
  }
}

export enum MessageSeverity {
  info = 'info',
  success = 'success',
  error = 'error',
  warn = 'warn'
}
// ******************** End ********************//
