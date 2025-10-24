import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { ListaClientesComponent } from '../components/lista-clientes/lista-clientes.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonContent, ListaClientesComponent],
})
export class Tab3Page {
  constructor() {}
}
