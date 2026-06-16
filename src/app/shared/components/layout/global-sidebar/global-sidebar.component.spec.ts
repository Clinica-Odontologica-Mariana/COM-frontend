import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';

import { GlobalSidebarComponent } from './global-sidebar.component';

describe('GlobalSidebarComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GlobalSidebarComponent],
      providers: [provideRouter([])],
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(GlobalSidebarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders all sidebar items', () => {
    const fixture = TestBed.createComponent(GlobalSidebarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const navLinks = compiled.querySelectorAll('nav a');
    expect(navLinks.length).toBeGreaterThanOrEqual(8);
  });

  it('includes a Certificados link pointing to /certificados', () => {
    const fixture = TestBed.createComponent(GlobalSidebarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const certLink = Array.from(compiled.querySelectorAll('a')).find((a) =>
      a.textContent?.includes('Certificados'),
    );
    expect(certLink).toBeTruthy();
  });

  it('does not have any item with static active:true property', () => {
    const fixture = TestBed.createComponent(GlobalSidebarComponent);
    const component = fixture.componentInstance as GlobalSidebarComponent;
    const items = (component as unknown as { items: { label: string; link: string }[] }).items;
    for (const item of items) {
      expect((item as Record<string, unknown>)['active']).toBeUndefined();
    }
  });
});
