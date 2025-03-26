import { describe, it, expect } from 'vitest';
import { filterWorkspaceDomain } from './users.js';

describe('filterWorkspaceDomain', () => {
    it('should return false for Google emails', () => {
        expect(filterWorkspaceDomain('user@google.com')).toBe(false);
        expect(filterWorkspaceDomain('user@subdomain.google.com')).toBe(false);
    });

    it('should return false for Gmail emails', () => {
        expect(filterWorkspaceDomain('user@gmail.com')).toBe(false);
    });

    it('should return true for non-Google/Gmail emails', () => {
        expect(filterWorkspaceDomain('user@example.com')).toBe(true);
        expect(filterWorkspaceDomain('user@microsoft.com')).toBe(true);
        expect(filterWorkspaceDomain('user@yahoo.com')).toBe(true);
    });

    it('should be case insensitive', () => {
        expect(filterWorkspaceDomain('user@GOOGLE.COM')).toBe(false);
        expect(filterWorkspaceDomain('user@Gmail.com')).toBe(false);
    });
});
