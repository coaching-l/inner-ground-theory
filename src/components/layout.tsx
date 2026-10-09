import type { ReactNode } from 'react';
import { APP_NAME, STEPS } from '../content/app';
import { navigate } from '../lib/router';
import type { StepNo } from '../lib/types';

export function TopBar(props: { title?: string; onBack?: () => void; backLabel?: string; right?: ReactNode }) {
  return (
    <header className="topbar no-print">
      <div className="topbar-inner">
        {props.onBack ? (
          <button type="button" className="topbar-back" onClick={props.onBack}>
            <span aria-hidden="true">‹</span> {props.backLabel ?? '戻る'}
          </button>
        ) : (
          <button type="button" className="topbar-brand" onClick={() => navigate({ name: 'home' })}>
            {APP_NAME}
          </button>
        )}
        {props.title && <span className="topbar-title">{props.title}</span>}
        <div className="topbar-right">{props.right}</div>
      </div>
    </header>
  );
}

export function Page(props: { children: ReactNode; className?: string }) {
  return <main className={`page ${props.className ?? ''}`}>{props.children}</main>;
}

/** STEP1〜3とまとめの進み具合。タップで行き来できる */
export function StepNav(props: { current: StepNo; onJump: (step: StepNo) => void }) {
  const items: { no: StepNo; label: string }[] = [
    ...STEPS.map((s) => ({ no: s.no as StepNo, label: s.short })),
    { no: 4, label: 'まとめ' },
  ];
  return (
    <nav className="stepnav no-print" aria-label="ステップ">
      <ol>
        {items.map((it) => (
          <li key={it.no} className={it.no === props.current ? 'is-current' : it.no < props.current ? 'is-past' : ''}>
            <button
              type="button"
              onClick={() => props.onJump(it.no)}
              aria-current={it.no === props.current ? 'step' : undefined}
            >
              <span className="stepnav-no">{it.no === 4 ? '✓' : it.no}</span>
              <span className="stepnav-label">{it.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function StepHeading(props: { step: 1 | 2 | 3; intro: string }) {
  const s = STEPS[props.step - 1];
  return (
    <div className="step-heading">
      <p className="eyebrow">
        STEP {s.no}　<span className="eyebrow-sub">{s.process}</span>
      </p>
      <h1 className="step-title">{s.title}</h1>
      <p className="lead">{props.intro}</p>
    </div>
  );
}

export function BottomBar(props: {
  onBack?: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="bottombar no-print">
      <div className="bottombar-inner">
        {props.onBack ? (
          <button type="button" className="btn btn-ghost" onClick={props.onBack}>
            {props.backLabel ?? '戻る'}
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="btn btn-primary" onClick={props.onNext} disabled={props.nextDisabled}>
          {props.nextLabel}
        </button>
      </div>
    </div>
  );
}
