import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavbarItem } from '../../../model/navbar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone : true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  @Input() items: NavbarItem[] = [];

  @Output()
  redirectEvent = new EventEmitter<any>();

  onRedirect(e : string){
    this.redirectEvent.emit(e);
  }
}
