import { APP_TAGLINE, BRAND, KEY_MESSAGE } from '../content/app';
import { DOMAIN_BY_ID } from '../content/domains';
import { BrandHeader, Page } from '../components/layout';
import { formatDate } from '../lib/compose';
import { navigate } from '../lib/router';
import type { Entry } from '../lib/types';

export function entryRoute(entry: Entry) {
  if (entry.status === 'quick') return { name: 'quick' as const, id: entry.id };
  return { name: 'entry' as const, id: entry.id, step: entry.status === 'done' ? 4 : entry.lastStep };
}

export const STATUS_LABEL: Record<Entry['status'], string> = {
  quick: '記録のみ',
  exploring: '探索中',
  done: '完了',
};

export function EntryItem(props: { entry: Entry; onDelete?: () => void }) {
  const { entry } = props;
  const event = entry.step1.event.trim() || entry.step1.thoughts.trim() || '（出来事は未記入）';
  return (
    <li className="entry-item">
      <button type="button" className="entry-main" onClick={() => navigate(entryRoute(entry))}>
        <span className="entry-meta">
          <span>{formatDate(entry.createdAt)}</span>
          <span className={`status status-${entry.status}`}>{STATUS_LABEL[entry.status]}</span>
        </span>
        <span className="entry-event">{event}</span>
        {(entry.step1.emotions.length > 0 || entry.step2.domains.length > 0) && (
          <span className="tags">
            {entry.step2.domains.map((id) => (
              <span key={id} className="tag tag-navy">
                {DOMAIN_BY_ID[id].name}
              </span>
            ))}
            {entry.step1.emotions.slice(0, 3).map((e) => (
              <span key={e} className="tag">
                {e}
              </span>
            ))}
          </span>
        )}
        {entry.status === 'quick' && <span className="entry-cta">続きを深める ›</span>}
      </button>
      {props.onDelete && (
        <button
          type="button"
          className="entry-delete"
          aria-label="この記録を削除"
          onClick={() => {
            if (window.confirm('この記録を削除しますか？元に戻せません。')) props.onDelete?.();
          }}
        >
          削除
        </button>
      )}
    </li>
  );
}

export function Home(props: { entries: Entry[]; onStart: () => void; onQuick: () => void }) {
  const inProgress = props.entries.filter((e) => e.status !== 'done').slice(0, 3);
  return (
    <Page className="home">
      <div className="hero">
        <BrandHeader />
        <p className="hero-tagline">{APP_TAGLINE}</p>
      </div>

      <div className="start-cards">
        <button type="button" className="start-card start-card-primary" onClick={props.onStart}>
          <span className="start-card-kicker">STEP1〜3｜10〜15分</span>
          <span className="start-card-title">出来事をふりかえる</span>
          <span className="start-card-text">刺激と反応から、自己知識・理解・受容まで</span>
        </button>
        <button type="button" className="start-card" onClick={props.onQuick}>
          <span className="start-card-kicker">1〜2分</span>
          <span className="start-card-title">さっと記録する</span>
          <span className="start-card-text">出来事と反応だけ。あとで深められます</span>
        </button>
      </div>

      {inProgress.length > 0 && (
        <section className="section">
          <h2 className="section-title">つづきから</h2>
          <ul className="entry-list">
            {inProgress.map((e) => (
              <EntryItem key={e.id} entry={e} />
            ))}
          </ul>
        </section>
      )}

      <nav className="link-list" aria-label="メニュー">
        <button type="button" onClick={() => navigate({ name: 'history' })}>
          <span>これまでの記録</span>
          <span className="link-count">{props.entries.length}件 ›</span>
        </button>
        <button type="button" onClick={() => navigate({ name: 'about' })}>
          <span>このアプリについて</span>
          <span aria-hidden="true">›</span>
        </button>
        <button type="button" onClick={() => navigate({ name: 'support' })}>
          <span>つらいときの相談先</span>
          <span aria-hidden="true">›</span>
        </button>
      </nav>

      <footer className="home-footer">
        <p>{KEY_MESSAGE}</p>
        <p className="small">© {BRAND}</p>
      </footer>
    </Page>
  );
}

export function History(props: { entries: Entry[]; onDelete: (id: string) => void }) {
  return (
    <Page>
      <div className="step-heading">
        <h1 className="step-title">これまでの記録</h1>
        <p className="lead">同じテーマが繰り返し現れても、後退とは限りません。異なる角度から、より深く扱えていることがあります。</p>
      </div>
      {props.entries.length === 0 ? (
        <p className="muted">まだ記録はありません。</p>
      ) : (
        <ul className="entry-list">
          {props.entries.map((e) => (
            <EntryItem key={e.id} entry={e} onDelete={() => props.onDelete(e.id)} />
          ))}
        </ul>
      )}
    </Page>
  );
}
