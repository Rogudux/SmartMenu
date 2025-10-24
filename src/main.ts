import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Registro de iconos
import { addIcons } from 'ionicons';
import {
  // Tabs / listas
  restaurantOutline,
  fastFoodOutline,
  cartOutline,
  receiptOutline,
  personOutline,
  peopleOutline,
  personCircleOutline,
  cubeOutline,
  layersOutline,
  walletOutline,
  timeOutline,
  alertCircleOutline,
  addOutline,
  createOutline, 
  trashOutline, 
  saveOutline,
  callOutline, 
  mailOutline,
  logOutOutline
  
  
  // Botones de acción
  
} from 'ionicons/icons';

addIcons({
  // Navegación / listas
  'restaurant-outline': restaurantOutline,
  'fast-food-outline': fastFoodOutline,
  'cart-outline': cartOutline,
  'receipt-outline': receiptOutline,
  'person-outline': personOutline,
  'people-outline': peopleOutline,
  'person-circle-outline': personCircleOutline,
  'cube-outline': cubeOutline,
  'layers-outline': layersOutline,
  'wallet-outline': walletOutline,
  'time-outline': timeOutline,
  'alert-circle-outline': alertCircleOutline,
  'add-outline': addOutline,
  'create-outline': createOutline,
  'trash-outline': trashOutline,
  'save-outline': saveOutline,
  'call-outline': callOutline,
  'mail-outline': mailOutline,
  'log-out-outline': logOutOutline
  

  
  // Acción
  // Si en algún lado usas “add-circle-outline”, entonces importa y registra:
  // 'add-circle-outline': addCircleOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideIonicAngular(),
    provideHttpClient(withInterceptorsFromDi()),
  ],
}).catch(err => console.error(err));
