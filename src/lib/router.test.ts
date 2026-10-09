import { describe, expect, it } from 'vitest';
import { parseHash, routeToHash, type Route } from './router';

describe('router', () => {
  it('URLと画面を相互に変換できる', () => {
    const routes: Route[] = [
      { name: 'home' },
      { name: 'history' },
      { name: 'about' },
      { name: 'support' },
      { name: 'welcome' },
      { name: 'quick', id: 'abc' },
      { name: 'entry', id: 'abc', step: 1 },
      { name: 'entry', id: 'abc', step: 4 },
    ];
    for (const r of routes) expect(parseHash(routeToHash(r))).toEqual(r);
  });

  it('知らないURLはホームに戻す', () => {
    expect(parseHash('#/e/abc/9')).toEqual({ name: 'home' });
    expect(parseHash('#/unknown')).toEqual({ name: 'home' });
    expect(parseHash('')).toEqual({ name: 'home' });
  });
});
