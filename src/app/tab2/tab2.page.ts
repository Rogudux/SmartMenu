import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { MenuComponent } from '../components/menu/menu.component';

@Component({
  selector: 'app-tab2',
  standalone: true,
  imports: [IonButtons, CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, MenuComponent],
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  user$: Observable<User | null>;
  constructor(private auth: AuthService) { this.user$ = this.auth.currentUser$; }
}
