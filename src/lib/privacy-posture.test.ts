import { describe, expect, it } from 'vitest';
import { getPrivacyPosture, getRpcHost, type RpcRoute } from './privacy-posture';

const defaultRoute: RpcRoute = {
  chain: 'Stellar',
  url: 'https://soroban-testnet.stellar.org',
  defaultUrl: 'https://soroban-testnet.stellar.org',
};

const privateRoute: RpcRoute = {
  chain: 'Stellar',
  url: 'https://rpc.example.internal',
  defaultUrl: 'https://soroban-testnet.stellar.org',
};

describe('getPrivacyPosture', () => {
  it('is strict when telemetry is off and all RPC routes are non-default', () => {
    expect(getPrivacyPosture(false, [privateRoute])).toBe('strict');
  });

  it('is relaxed when telemetry is on with a non-default RPC', () => {
    expect(getPrivacyPosture(true, [privateRoute])).toBe('relaxed');
  });

  it('is relaxed when telemetry is off with a default RPC', () => {
    expect(getPrivacyPosture(false, [defaultRoute])).toBe('relaxed');
  });

  it('is relaxed when telemetry is on with a default RPC', () => {
    expect(getPrivacyPosture(true, [defaultRoute])).toBe('relaxed');
  });

  it('requires every configured RPC route to be non-default for strict mode', () => {
    expect(getPrivacyPosture(false, [privateRoute, defaultRoute])).toBe('relaxed');
  });
});

describe('getRpcHost', () => {
  it('extracts a copyable host without leaking path details', () => {
    expect(getRpcHost('https://testnet.ckb.dev/rpc')).toBe('testnet.ckb.dev');
  });
});
