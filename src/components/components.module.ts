import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';

import { FavoritosItemMenuComponent } from './favoritos-item-menu/favoritos-item-menu';
@NgModule({
	declarations: [FavoritosItemMenuComponent],
	imports: [
		CommonModule,
		IonicModule,
	],
	exports: [FavoritosItemMenuComponent]
})
export class ComponentsModule {}
