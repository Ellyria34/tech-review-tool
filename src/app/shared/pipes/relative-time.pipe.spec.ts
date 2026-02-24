import {RelativeTimePipe} from './relative-time-pipe';
import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';


describe( 'RelativeTimePipe', () => {
    let pipe: RelativeTimePipe;

    // Freeze time at : Monday, February 24, 2026 at 12:00:00 UTC
    const FAKE_NOW = new Date('2026-02-24T12:00:00Z');

    beforeEach( () => {
        pipe = new RelativeTimePipe();
        // Freeze the clock — new Date() will always return FAKE_NOW
        vi.useFakeTimers();
        vi.setSystemTime(FAKE_NOW);
    });

    afterEach(() => {
        // Restore real timers after each test — clean up
        vi.useRealTimers();
    });


    //Adge cases : null, undefined, empty
    it('should return empty string for null', () => {
        expect(pipe.transform(null)).toBe('');
     });

    it('should return empty string for undefined', () => {
        expect(pipe.transform(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
        expect(pipe.transform('')).toBe('');
    });

    // Less than 1 minute → "À l'instant"
    it('should return "À l\'instant" for less than 1 minute ago', () => {
    // 30 seconds ago
        const date = new Date(FAKE_NOW.getTime() - 30_000).toISOString();
        expect(pipe.transform(date)).toBe("À l'instant");
    });

    it('should return "À l\'instant" for exactly now', () => {
        const date = FAKE_NOW.toISOString();
        expect(pipe.transform(date)).toBe("À l'instant");
    });


    // Less than 1 hour → "Il y a X min"
    it('should return "Il y a 1 min" for exactly 1 minute ago', () => {
        const date = new Date(FAKE_NOW.getTime() - 60_000).toISOString();
        expect(pipe.transform(date)).toBe('Il y a 1 min');
    });

    it('should return "Il y a 23 min" for 23 minutes ago', () => {
        const date = new Date(FAKE_NOW.getTime() - 23 * 60_000).toISOString();
        expect(pipe.transform(date)).toBe('Il y a 23 min');
    });

    it('should return "Il y a 59 min" for 59 minutes ago', () => {
        const date = new Date(FAKE_NOW.getTime() - 59 * 60_000).toISOString();
        expect(pipe.transform(date)).toBe('Il y a 59 min');
    });


    // Less than 24 hours → "Il y a Xh"
    it('should return "Il y a 1h" for exactly 1 hour ago', () => {
        const date = new Date(FAKE_NOW.getTime() - 3_600_000).toISOString();
        expect(pipe.transform(date)).toBe('Il y a 1h');
    });

    it('should return "Il y a 5h" for 5 hours ago', () => {
        const date = new Date(FAKE_NOW.getTime() - 5 * 3_600_000).toISOString();
        expect(pipe.transform(date)).toBe('Il y a 5h');
    });

    it('should return "Il y a 23h" for 23 hours ago', () => {
        const date = new Date(FAKE_NOW.getTime() - 23 * 3_600_000).toISOString();
        expect(pipe.transform(date)).toBe('Il y a 23h');
    });


    // Yesterday → "Hier à HHhMM"
    it('should return "Hier à ..." for yesterday morning', () => {
        // Build yesterday at 08:30 LOCAL time (always > 24h ago from noon)
        const yesterday = new Date(FAKE_NOW);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(8, 30, 0, 0);

        expect(pipe.transform(yesterday.toISOString())).toBe('Hier à 08h30');
    });

    it('should return "Hier à ..." for yesterday early morning', () => {
    // Build yesterday at 02:15 LOCAL time (always > 24h ago from noon)
    const yesterday = new Date(FAKE_NOW);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(2, 15, 0, 0);

    expect(pipe.transform(yesterday.toISOString())).toBe('Hier à 02h15');
  });


    // Older → "dd/mm/yyyy"
    it('should return formatted date for 3 days ago', () => {
        const date = '2026-02-21T10:00:00Z';
        expect(pipe.transform(date)).toBe('21/02/2026');
    });

    it('should return formatted date for last month', () => {
        const date = '2026-01-15T08:00:00Z';
        expect(pipe.transform(date)).toBe('15/01/2026');
    });

    it('should return formatted date for last year', () => {
        const date = '2025-06-01T12:00:00Z';
        expect(pipe.transform(date)).toBe('01/06/2025');
    });
});