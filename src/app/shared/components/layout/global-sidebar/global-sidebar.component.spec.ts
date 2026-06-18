import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { GlobalSidebarComponent } from './global-sidebar.component';

describe('GlobalSidebarComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GlobalSidebarComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
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

  it('Certificados item has correct link and match', () => {
    const fixture = TestBed.createComponent(GlobalSidebarComponent);
    const component = fixture.componentInstance as GlobalSidebarComponent;
    const items = (
      component as unknown as { items: { label: string; link: string; match: string[] }[] }
    ).items;
    const certItem = items.find((i) => i.label === 'Certificados');
    expect(certItem?.link).toBe('/certificados');
    expect(certItem?.match).toContain('/certificados');
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
