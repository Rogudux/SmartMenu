import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { InventarioComponent } from '../components/inventario/inventario.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab4.component.html',
  standalone: true,
  styleUrls: ['tab4.component.scss'],
  imports: [IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonContent, InventarioComponent ],
})
export class Tab4Page {
  constructor() {}
}
