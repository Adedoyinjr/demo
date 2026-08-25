import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getConsent, setConsent, subscribeToConsent } from './telemetry';

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe('telemetry consent subscriptions', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    vi.stubGlobal('window', new EventTarget());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('notifies same-tab subscribers immediately when consent changes', () => {
    let updates = 0;
    const unsubscribe = subscribeToConsent(() => {
      updates += 1;
    });

    setConsent('accepted');

    expect(getConsent()).toBe('accepted');
    expect(updates).toBe(1);

    unsubscribe();
    setConsent('declined');
    expect(updates).toBe(1);
  });
});
