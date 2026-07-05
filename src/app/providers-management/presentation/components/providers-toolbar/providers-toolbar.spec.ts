import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersToolbar } from './providers-toolbar';
import { TranslateService } from '@ngx-translate/core';

describe('ProvidersToolbar', () => {
  let component: ProvidersToolbar;
  let fixture: ComponentFixture<ProvidersToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvidersToolbar],
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

    fixture = TestBed.createComponent(ProvidersToolbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
