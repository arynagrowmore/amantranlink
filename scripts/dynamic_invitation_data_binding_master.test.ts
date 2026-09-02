/**
 * 🧪 AMANTRANLINK DYNAMIC INVITATION DATA BINDING MASTER TEST SUITE
 * Validates universal normalization, multi-language couple formatting, monogram generation,
 * date timestamp parsing, static text residue sweeping, and cross-invitation isolation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  normalizeInvitationData, 
  parseWeddingDateToTimestamp, 
  sweepStaticTemplateTextNodes 
} from '../src/utils/invitationAdapter';
import { extractPublicSlugFromUrl } from '../src/components/StandaloneInvitationView';
import { resolveInvitationState } from '../src/utils/invitationStorage';

// Minimal in-memory mock DOM node for Node environment
class MockTextNode {
  nodeType = 3;
  nodeValue: string;
  childNodes: any[] = [];
  constructor(text: string) {
    this.nodeValue = text;
  }
}

class MockElementNode {
  nodeType = 1;
  tagName: string;
  childNodes: any[] = [];
  constructor(tagName: string, ...children: any[]) {
    this.tagName = tagName;
    this.childNodes = children;
  }
  get textContent(): string {
    return this.childNodes.map(c => c.nodeValue || c.textContent || '').join(' ');
  }
}

// In-memory localStorage mock
const storageMap = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, val: string) => storageMap.set(key, val),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};

(globalThis as any).localStorage = mockLocalStorage;
if (!(globalThis as any).window) {
  (globalThis as any).window = {
    location: { pathname: '/', search: '', hash: '' },
    localStorage: mockLocalStorage,
  };
}

describe('👑 Universal Invitation Data Binding Master Suite', () => {

  beforeEach(() => {
    storageMap.clear();
    if (globalThis.window) {
      globalThis.window.location = { pathname: '/', search: '', hash: '' } as any;
    }
  });

  describe('1. Universal Invitation Data Normalizer', () => {
    it('normalizes custom bride and groom names, date, and venue into unified contract', () => {
      const raw = {
        theme: 'royaldawn',
        couple: {
          groomEn: 'Kabir',
          brideEn: 'Sanjana',
          weddingDate: '15 December 2026 · 07:00 PM',
          venueName: 'Udaivilas Palace, Udaipur',
        },
        family: {
          groomParentsEn: 'Dr. & Mrs. Mehta',
          brideParentsEn: 'Mr. & Mrs. Singhania',
          rsvp1Name: 'Dr. Kabir',
          rsvp1Phone: '+91 9876543210',
        },
        events: [
          { id: '1', name: 'Sangeet Gala', date: '14 Dec 2026', time: '08:00 PM', venue: 'Lakefront Lawn' },
        ],
      };

      const normalized = normalizeInvitationData(raw, 'kabir-sanjana');

      expect(normalized.groom.name).toBe('Kabir');
      expect(normalized.bride.name).toBe('Sanjana');
      expect(normalized.coupleDisplayName).toBe('Kabir & Sanjana');
      expect(normalized.monogramDot).toBe('K · S');
      expect(normalized.monogramAmp).toBe('K & S');
      expect(normalized.hashtag).toBe('#KabirWedsSanjana');
      expect(normalized.wedding.venueName).toBe('Udaivilas Palace, Udaipur');
      expect(normalized.wedding.rawDate).toBe('15 December 2026 · 07:00 PM');
      expect(normalized.family.groomParents).toBe('Dr. & Mrs. Mehta');
      expect(normalized.family.rsvp1Phone).toBe('+91 9876543210');
      expect(normalized.events.length).toBe(1);
    });

    it('correctly handles Hindi and Gujarati language formatting for couple names', () => {
      const rawHindi = {
        language: 'hi',
        couple: {
          groomEn: 'Aarav',
          groomHi: 'आरव',
          brideEn: 'Diya',
          brideHi: 'दिया',
        }
      };
      const normalizedHindi = normalizeInvitationData(rawHindi);
      expect(normalizedHindi.coupleDisplayName).toBe('आरव एवं दिया');

      const rawGujarati = {
        language: 'gu',
        couple: {
          groomEn: 'Aarav',
          groomGu: 'આરવ',
          brideEn: 'Diya',
          brideGu: 'દિયા',
        }
      };
      const normalizedGujarati = normalizeInvitationData(rawGujarati);
      expect(normalizedGujarati.coupleDisplayName).toBe('આરવ અને દિયા');
    });
  });

  describe('2. Robust Wedding Date Timestamp Parsing', () => {
    it('parses text dates like "15 December 2026 · 07:00 PM" into correct future timestamp', () => {
      const ts = parseWeddingDateToTimestamp('15 December 2026 · 07:00 PM');
      const date = new Date(ts);
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(11); // December = 11
      expect(date.getDate()).toBe(15);
    });

    it('parses ISO dates like "2026-11-20" cleanly', () => {
      const ts = parseWeddingDateToTimestamp('2026-11-20');
      const date = new Date(ts);
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(10); // November = 10
      expect(date.getDate()).toBe(20);
    });
  });

  describe('3. Multi-Pass Static Text Sweeper & DOM Replacer', () => {
    it('replaces all residual demo names (Rudra, Ishani, Shalini, 3 December 2024) in DOM tree', () => {
      const rootNode = new MockElementNode('div',
        new MockElementNode('h1', new MockTextNode('Rudra & Ishani')),
        new MockElementNode('p', new MockTextNode('Together with their families Rudra & Shalini invite you on 3 December 2024 at The Grand Haveli')),
        new MockElementNode('span', new MockTextNode('#RudraKiIshani'))
      );

      const normalized = normalizeInvitationData({
        couple: {
          groomEn: 'Aryan',
          brideEn: 'Helly',
          weddingDate: '10 December 2026',
          venueName: 'Royal Orchid Resort',
        }
      });

      sweepStaticTemplateTextNodes(rootNode as any, normalized);

      const textContent = rootNode.textContent;
      expect(textContent).not.toContain('Rudra');
      expect(textContent).not.toContain('Ishani');
      expect(textContent).not.toContain('Shalini');
      expect(textContent).not.toContain('3 December 2024');
      expect(textContent).not.toContain('The Grand Haveli');

      expect(textContent).toContain('Aryan');
      expect(textContent).toContain('Helly');
      expect(textContent).toContain('10 December 2026');
      expect(textContent).toContain('Royal Orchid Resort');
    });
  });

  describe('4. Cross-Invitation Data Isolation in Storage', () => {
    it('does not leak another studio state when resolving an explicit non-existent slug', () => {
      localStorage.setItem('WEDDING_STUDIO_STATE', JSON.stringify({
        couple: { groomEn: 'OtherGroom', brideEn: 'OtherBride' }
      }));

      const res = resolveInvitationState('unknown-unrelated-couple-slug');
      // Should NOT return OtherGroom & OtherBride for an unrelated slug
      expect(res).toBeNull();
    });

    it('returns exact saved state when querying matching registered slug', () => {
      const savedWedding = {
        theme: 'rajmahal',
        couple: { groomEn: 'Dhruv', brideEn: 'Shreya', weddingDate: '10 Dec 2026' }
      };
      localStorage.setItem('SHAHI_INVITE_dhruv-shreya', JSON.stringify(savedWedding));

      const res = resolveInvitationState('dhruv-shreya');
      expect(res).toBeDefined();
      expect(res?.couple?.groomEn).toBe('Dhruv');
      expect(res?.couple?.brideEn).toBe('Shreya');
    });
  });
});
