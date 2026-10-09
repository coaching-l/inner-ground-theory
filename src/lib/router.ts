// URLの # 以降で画面を切り替える（静的ホスティングでもそのまま動く）

import { useEffect, useState } from 'react';
import type { StepNo } from './types';

export type Route =
  | { name: 'home' }
  | { name: 'welcome' }
  | { name: 'history' }
  | { name: 'about' }
  | { name: 'support' }
  | { name: 'quick'; id: string }
  | { name: 'entry'; id: string; step: StepNo };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  switch (parts[0]) {
    case 'welcome':
      return { name: 'welcome' };
    case 'history':
      return { name: 'history' };
    case 'about':
      return { name: 'about' };
    case 'support':
      return { name: 'support' };
    case 'q':
      if (parts[1]) return { name: 'quick', id: parts[1] };
      break;
    case 'e': {
      const step = Number(parts[2] === 'done' ? 4 : parts[2]);
      if (parts[1] && [1, 2, 3, 4].includes(step)) return { name: 'entry', id: parts[1], step: step as StepNo };
      break;
    }
  }
  return { name: 'home' };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'quick':
      return `#/q/${route.id}`;
    case 'entry':
      return `#/e/${route.id}/${route.step === 4 ? 'done' : route.step}`;
    default:
      return `#/${route.name}`;
  }
}

export function navigate(route: Route): void {
  window.location.hash = routeToHash(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
