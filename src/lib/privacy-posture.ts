export type PrivacyPosture = 'strict' | 'relaxed';

export interface RpcRoute {
  chain: string;
  url: string;
  defaultUrl: string;
}

function normalizeRpcUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/$/, '')}`;
  } catch {
    return url.replace(/\/$/, '');
  }
}

export function getRpcHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function getPrivacyPosture(
  telemetryEnabled: boolean,
  routes: readonly RpcRoute[],
): PrivacyPosture {
  const allRoutesAreNonDefault =
    routes.length > 0 &&
    routes.every((route) => normalizeRpcUrl(route.url) !== normalizeRpcUrl(route.defaultUrl));

  return !telemetryEnabled && allRoutesAreNonDefault ? 'strict' : 'relaxed';
}
