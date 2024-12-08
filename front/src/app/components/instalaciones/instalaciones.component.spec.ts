import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstalacionesComponent } from './instalaciones.component';

describe('InstalacionesComponent', () => {
  let component: InstalacionesComponent;
  let fixture: ComponentFixture<InstalacionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InstalacionesComponent]
    });
    fixture = TestBed.createComponent(InstalacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
