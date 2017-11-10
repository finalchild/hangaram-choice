import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA, MdDialogRef} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {ListEditorComponent} from './admin-list-editor.component';

@Component({
  selector: 'hc-admin-initialize-dialog',
  templateUrl: './admin-initialize-dialog.component.html',
})
export class InitializeDialogComponent {

  constructor(
    private dialogRef: MdDialogRef<InitializeDialogComponent>,
    private http: HttpClient,
    @Inject(MD_DIALOG_DATA) public data: any) {}

  pollName: String = '한가람고등학교 학생회장단 선거';
  candidateNames1M: ListEditorComponent;
  candidateNames1F: ListEditorComponent;
  candidateNames2: ListEditorComponent;

  onYesClick() {
    this.http.post('http://localhost:3000/api/initializepoll', {
      pollName: this.pollName,
      candidateNames1M: this.candidateNames1M.stringList,
      candidateNames1F: this.candidateNames1F.stringList,
      candidateNames2: this.candidateNames2.stringList
    }).subscribe(data => {
      alert(data['message']);
      this.dialogRef.close();
    }, err => {
      console.log(err);
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
