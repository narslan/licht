import { Route, Router } from '@vaadin/router';
import './views/chess.component';
import './views/home-view';
import './views/homews';

import './main-layout';


export const views: Route[] = [
  {
    path: '/',
    component: 'home-view'
  },
  {
    path: '/chess',
    component: 'chess.component'
  },
  {
    path: '/homews',
    component: 'homews'
  }
];

// @ts-ignore
export const routes: Route[] = [
  {
    path: '',
    component: 'main-layout',
    children: [...views],
  },
];

export const router = new Router(document.querySelector('#outlet'));

router.setRoutes(routes); 
