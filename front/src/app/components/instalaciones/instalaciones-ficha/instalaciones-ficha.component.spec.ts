import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstalacionesFichaComponent } from './instalaciones-ficha.component';

describe('InstalacionesFichaComponent', () => {
  let component: InstalacionesFichaComponent;
  let fixture: ComponentFixture<InstalacionesFichaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InstalacionesFichaComponent]
    });
    fixture = TestBed.createComponent(InstalacionesFichaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
