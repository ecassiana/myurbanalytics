import { Component } from '@angular/core';

/**
 * Generated class for the FavoritosItemMenuComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'favoritos-item-menu',
  templateUrl: 'favoritos-item-menu.html'
})
export class FavoritosItemMenuComponent {

  text: string;

  constructor() {
    console.log('Hello FavoritosItemMenuComponent Component');
    this.text = 'Hello World';
  }

}
