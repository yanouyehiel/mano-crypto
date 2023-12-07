import { Component, OnInit } from '@angular/core';
import * as fileData from '../file-manager'

@Component({
  selector: 'app-file-items',
  templateUrl: './file-items.component.html',
  styleUrls: ['./file-items.component.scss']
})
export class FileItemsComponent implements OnInit {

  // data
  public Quickdata = fileData.Quickdata
  public FoldersData = fileData.FoldersData
  public FilesData = fileData.FilesData

  constructor() { }

  ngOnInit(): void {
  }
  active = 1;
}
