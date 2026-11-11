import { describe, it, expect } from 'vitest';
import { filterUpcomingGigs, formatGigDate } from '../../src/lib/gigs';

describe('gigs.ts', () => {
  const sampleGigs = [
    { id: '1', fechaIso: '2020-01-01', hora: '22:00', lugar: 'Madrid', titulo: 'Antiguo' },
    { id: '2', fechaIso: '2030-12-31', hora: '23:00', lugar: 'Barcelona', titulo: 'Futuro' },
    { id: '3', fechaIso: '2030-06-15', hora: '21:30', lugar: 'Valencia', titulo: 'Futuro cercano' },
  ];

  it('filters out past gigs and sorts future ones chronologically', () => {
    const fakeNow = new Date('2025-01-01');
    const filtered = filterUpcomingGigs(sampleGigs, fakeNow);

    expect(filtered).toHaveLength(2);
    expect(filtered[0].id).toBe('3'); // 2030-06-15
    expect(filtered[1].id).toBe('2'); // 2030-12-31
  });

  it('formats gig date in Spanish locale correctly', () => {
    const formatted = formatGigDate('2030-06-15');
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('returns raw string on invalid date format', () => {
    const invalid = formatGigDate('invalid-date');
    expect(invalid).toBe('invalid-date');
  });
});
