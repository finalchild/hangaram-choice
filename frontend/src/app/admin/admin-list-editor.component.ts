import {Component} from '@angular/core';

@Component({
  selector: 'hc-admin-list-editor',
  templateUrl: './admin-list-editor.component.html'
})
export class ListEditorComponent {

  public stringList: Array<String>;
  public stringToAdd: String;

  onStringToAddKeypress(event) {
    if (event.keyCode === 13) {
      this.stringList.push(this.stringToAdd);
      this.stringToAdd = '';
    }
  }

}
