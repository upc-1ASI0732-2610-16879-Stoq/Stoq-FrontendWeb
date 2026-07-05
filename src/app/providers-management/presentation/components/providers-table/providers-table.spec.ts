import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersTable } from './providers-table';
import { TranslateService } from '@ngx-translate/core';

describe('ProvidersTable', () => {
  let component: ProvidersTable;
  let fixture: ComponentFixture<ProvidersTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvidersTable],
      providers: [
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => key
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvidersTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
