import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { ImprintComponent } from './pages/imprint/imprint.component';

export const routes: Routes = [
  {
    path: 'impressum',
    component: ImprintComponent,
  },
  {
    path: '',
    component: MainComponent,
  },
];
