import {Component} from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';

import {MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton, MatFabButton} from '@angular/material/button';

@Component({
  selector: 'app-providers-toolbar',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatIconModule,
    TranslatePipe,
    MatButton,
    MatFabButton
  ],
  templateUrl: './providers-toolbar.html',
  styleUrl: './providers-toolbar.css'
})
export class ProvidersToolbar {
  searchTerm = '';


  openAddProviderDialog() {

  }
}
