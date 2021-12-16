import { Injectable } from '@angular/core';
import { FileEndpoint } from './endpoints/file.endpoint';

@Injectable()
export class FileService {

    constructor(private fileEndpoint: FileEndpoint) { }
}
