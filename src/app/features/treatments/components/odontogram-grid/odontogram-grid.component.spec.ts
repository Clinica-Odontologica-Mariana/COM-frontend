import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { OdontogramGridComponent } from './odontogram-grid.component';
import { Procedure, ToothState } from '../../models/treatment.model';

// ── stub for StatusBadgeComponent ────────────────────────────────────────────

@Component({ selector: 'app-status-badge', template: '', standalone: true })
class StubStatusBadge {
  status = '';
}

// ── helpers ───────────────────────────────────────────────────────────────────

const UPPER_ARCH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ARCH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const ALL_TEETH = [...UPPER_ARCH, ...LOWER_ARCH];

const makeProcedure = (o: Partial<Procedure> = {}): Procedure => ({
  id: 'proc-1',
  name: 'Extração',
  type: 'Cirurgia',
  startDate: '01/01/2024',
  endDate: '',
  value: 300,
  teeth: [18],
  materials: [],
  status: 'completed',
  subtitle: 'Cirurgia — 1 dente',
  ...o,
});

// ── setup ─────────────────────────────────────────────────────────────────────

describe('OdontogramGridComponent', () => {
  let fixture: ComponentFixture<OdontogramGridComponent>;
  let component: OdontogramGridComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OdontogramGridComponent],
    })
      .overrideComponent(OdontogramGridComponent, {
        remove: { imports: [] },
        add: { imports: [StubStatusBadge] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(OdontogramGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── arch constants ──────────────────────────────────────────────────────────

  it('exposes the 16 upper-arch teeth in FDI order', () => {
    expect(component['upperArch']).toEqual(UPPER_ARCH);
  });

  it('exposes the 16 lower-arch teeth in FDI order', () => {
    expect(component['lowerArch']).toEqual(LOWER_ARCH);
  });

  // ── styleFor ────────────────────────────────────────────────────────────────

  describe('styleFor', () => {
    const cases: Array<[ToothState, string]> = [
      ['default', '#EEEEEE'],
      ['selected', 'rgba(34,197,94,0.18)'],
      ['pending', '#FEF3C7'],
      ['note', 'rgba(34,145,197,0.18)'],
      ['inactive', '#EEEEEE'],
    ];

    for (const [state, expectedBg] of cases) {
      it(`returns bg ${expectedBg} for state "${state}"`, () => {
        fixture.componentRef.setInput('toothStates', { 11: state });
        const style = component['styleFor'](11);
        expect(style.bg).toBe(expectedBg);
      });
    }

    it('falls back to default style for teeth with no state entry', () => {
      fixture.componentRef.setInput('toothStates', {});
      const style = component['styleFor'](99);
      expect(style.bg).toBe('#EEEEEE');
    });
  });

  // ── onClick ─────────────────────────────────────────────────────────────────

  describe('onClick in readonly mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
    });

    it('sets activeTooth to the clicked tooth', () => {
      component['onClick'](18);
      expect(component['activeTooth']()).toBe(18);
    });

    it('clears activeTooth when the same tooth is clicked twice', () => {
      component['onClick'](18);
      component['onClick'](18);
      expect(component['activeTooth']()).toBeNull();
    });

    it('does not emit toothToggled', () => {
      const spy = vi.fn();
      component.toothToggled.subscribe(spy);
      component['onClick'](18);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onClick in editable mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('readonly', false);
      fixture.detectChanges();
    });

    it('emits toothToggled with the tooth number', () => {
      const spy = vi.fn();
      component.toothToggled.subscribe(spy);
      component['onClick'](21);
      expect(spy).toHaveBeenCalledWith(21);
    });

    it('does not change activeTooth', () => {
      component['onClick'](21);
      expect(component['activeTooth']()).toBeNull();
    });
  });

  // ── toothProcedures ─────────────────────────────────────────────────────────

  describe('toothProcedures', () => {
    it('returns empty array when no active tooth is set', () => {
      fixture.componentRef.setInput('procedures', [makeProcedure({ teeth: [18] })]);
      expect(component['toothProcedures']()).toEqual([]);
    });

    it('returns procedures linked to the active tooth', () => {
      const proc = makeProcedure({ id: 'p1', teeth: [18, 21] });
      fixture.componentRef.setInput('procedures', [proc]);
      component['activeTooth'].set(18);
      expect(component['toothProcedures']()).toHaveLength(1);
      expect(component['toothProcedures']()[0].id).toBe('p1');
    });

    it('excludes procedures for other teeth', () => {
      const p1 = makeProcedure({ id: 'p1', teeth: [18] });
      const p2 = makeProcedure({ id: 'p2', teeth: [21] });
      fixture.componentRef.setInput('procedures', [p1, p2]);
      component['activeTooth'].set(18);
      const result = component['toothProcedures']();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');
    });
  });

  // ── mobileGroups ────────────────────────────────────────────────────────────

  describe('mobileGroups', () => {
    it('returns empty array when no tooth has a non-default state', () => {
      fixture.componentRef.setInput('toothStates', {});
      expect(component['mobileGroups']()).toEqual([]);
    });

    it('excludes default and inactive states from groups', () => {
      fixture.componentRef.setInput('toothStates', { 11: 'default', 12: 'inactive' });
      expect(component['mobileGroups']()).toEqual([]);
    });

    it('groups teeth by state', () => {
      fixture.componentRef.setInput('toothStates', {
        11: 'selected',
        12: 'selected',
        21: 'pending',
      });
      const groups = component['mobileGroups']();
      const selectedGroup = groups.find((g) => g.state === 'selected');
      const pendingGroup = groups.find((g) => g.state === 'pending');
      expect(selectedGroup?.count).toBe(2);
      expect(pendingGroup?.count).toBe(1);
    });

    it('samples up to 2 teeth per group', () => {
      fixture.componentRef.setInput('toothStates', {
        11: 'selected',
        12: 'selected',
        13: 'selected',
      });
      const groups = component['mobileGroups']();
      const g = groups.find((g) => g.state === 'selected');
      expect(g?.sample).toHaveLength(2);
      expect(g?.showPlus).toBe(true);
    });

    it('does not set showPlus when count ≤ 2', () => {
      fixture.componentRef.setInput('toothStates', { 11: 'note' });
      const groups = component['mobileGroups']();
      expect(groups[0].showPlus).toBe(false);
    });
  });

  // ── tooltip toggle ──────────────────────────────────────────────────────────

  describe('tooltip', () => {
    it('starts hidden', () => {
      expect(component['showTooltip']()).toBe(false);
    });

    it('toggles on button click', () => {
      component['showTooltip'].set(!component['showTooltip']());
      expect(component['showTooltip']()).toBe(true);
      component['showTooltip'].set(false);
      expect(component['showTooltip']()).toBe(false);
    });
  });
});
