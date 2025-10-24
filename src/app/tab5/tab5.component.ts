import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { CuentaComponent } from '../components/cuenta/cuenta.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab5.component.html',
  styleUrls: ['tab5.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CuentaComponent],
})
export class Tab5Page {
  constructor() {}
}
