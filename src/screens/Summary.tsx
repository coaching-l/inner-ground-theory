import { APP_NAME, SUMMARY_COPY } from '../content/app';
import { DOMAIN_BY_ID } from '../content/domains';
import { INTENSITY_LABELS } from '../content/reactions';
import { BottomBar, Page, StepNav, TopBar } from '../components/layout';
import { SupportList } from '../components/SupportBox';
import { showToast } from '../components/Toast';
import { Field, Notice, Section } from '../components/ui';
import { copyText, canShare, shareText } from '../lib/clipboard';
import { levelOf } from '../lib/intensity';
import { navigate } from '../lib/router';
import { acceptanceSentence, buildSessionSheet, formatDate, understandingText } from '../lib/compose';
import type { Feeling, SummaryData } from '../lib/types';
import type { EntryScreenProps } from './types';

export function Summary({ entry, update, goStep, onExit, onDelete }: EntryScreenProps & { onDelete: () => void }) {
  const { step1, step2, step3, summary } = entry;
  const set = (patch: Partial<SummaryData>) => update((e) => ({ ...e, summary: { ...e.summary, ...patch } }));
  const understanding = understandingText(entry);
  const acceptance = acceptanceSentence(entry);

  const copySheet = async () => {
    const ok = await copyText(buildSessionSheet(entry));
    showToast(ok ? 'セッション準備シートをコピーしました' : 'コピーできませんでした');
  };

  return (
    <>
      <TopBar onBack={onExit} backLabel="ホーム" />
      <StepNav current={4} onJump={goStep} />
      <Page>
        <div className="step-heading no-print">
          <p className="eyebrow">まとめ</p>
          <h1 className="step-title">今回の内省カード</h1>
          <p className="lead">ここまでの内容を一枚にまとめました。セッション前に見返したり、コーチに共有したりできます。</p>
        </div>

        <article className="card print-area">
          <header className="card-head">
            <p className="card-brand">{APP_NAME}</p>
            <p className="card-date">{formatDate(entry.createdAt)}</p>
          </header>

          <dl className="card-list">
            {step1.event.trim() && (
              <div>
                <dt>出来事</dt>
                <dd>{step1.event}</dd>
              </div>
            )}
            {(step1.emotions.length > 0 || step1.body.length > 0) && (
              <div>
                <dt>反応</dt>
                <dd>
                  {step1.emotions.length > 0 && (
                    <span className="tags">
                      {step1.emotions.map((e) => {
                        const level = levelOf(step1.intensities, e);
                        return (
                          <span key={e} className="tag">
                            {e}
                            {level && <span className="tag-level">{INTENSITY_LABELS[level]}</span>}
                          </span>
                        );
                      })}
                    </span>
                  )}
                  {step1.body.length > 0 && <span className="card-sub">身体：{step1.body.join('、')}</span>}
                </dd>
              </div>
            )}
            {step1.thoughts.trim() && (
              <div>
                <dt>頭の中の言葉</dt>
                <dd>「{step1.thoughts.trim()}」</dd>
              </div>
            )}
            {step2.domains.length > 0 && (
              <div>
                <dt>関係していた領域</dt>
                <dd>
                  {step2.domains.map((id) => (
                    <p key={id} className="card-domain">
                      <span className="tag tag-navy">{DOMAIN_BY_ID[id].name}</span>
                      {step2.insights[id]?.trim() && <span>{step2.insights[id]}</span>}
                    </p>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          {understanding.trim() && (
            <div className="card-quote">
              <p className="card-quote-label">理解</p>
              <p className="prewrap">{understanding}</p>
            </div>
          )}
          {acceptance && (
            <div className="card-quote card-quote-gold">
              <p className="card-quote-label">受容</p>
              <p>{acceptance}</p>
              {step3.acceptMode === 'notyet' && step3.notYetNote.trim() && (
                <p className="card-sub prewrap">{step3.notYetNote}</p>
              )}
            </div>
          )}
          {summary.nextSign.trim() && (
            <div className="card-next">
              <p className="card-quote-label">次に気づきたいサイン</p>
              <p className="prewrap">{summary.nextSign}</p>
            </div>
          )}
        </article>

        <Section className="no-print">
          <Field
            label={SUMMARY_COPY.nextSignLabel}
            hint={SUMMARY_COPY.nextSignHint}
            value={summary.nextSign}
            onChange={(nextSign) => set({ nextSign })}
            placeholder={SUMMARY_COPY.nextSignPlaceholder}
          />
          <Field
            label={SUMMARY_COPY.coachNoteLabel}
            value={summary.coachNote}
            onChange={(coachNote) => set({ coachNote })}
            placeholder={SUMMARY_COPY.coachNotePlaceholder}
          />
        </Section>

        <Section title={SUMMARY_COPY.feelingLabel} className="no-print">
          <div className="segmented segmented-3" role="radiogroup" aria-label={SUMMARY_COPY.feelingLabel}>
            {SUMMARY_COPY.feelings.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={summary.feeling === f.id}
                className={summary.feeling === f.id ? 'is-on' : ''}
                onClick={() => set({ feeling: summary.feeling === f.id ? null : (f.id as Feeling) })}
              >
                {f.label}
              </button>
            ))}
          </div>
          {summary.feeling === 'heavy' && (
            <Notice tone="gold">
              <p>{SUMMARY_COPY.heavyMessage}</p>
              <p className="small">つらさが強いときは、こちらにも相談できます。</p>
              <SupportList />
            </Notice>
          )}
        </Section>

        <Section className="no-print">
          <Notice tone="navy" title="この先は、セッションで">
            <p>{SUMMARY_COPY.bridge}</p>
          </Notice>
          <div className="actions">
            <button type="button" className="btn btn-outline" onClick={copySheet}>
              セッション準備シートをコピー
            </button>
            {canShare() && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => shareText(`${APP_NAME}｜セッション準備シート`, buildSessionSheet(entry))}
              >
                共有する
              </button>
            )}
            <button type="button" className="btn btn-outline" onClick={() => window.print()}>
              印刷・PDFで保存
            </button>
          </div>
          <button
            type="button"
            className="btn btn-danger-text"
            onClick={() => {
              if (window.confirm('この記録を削除しますか？元に戻せません。')) onDelete();
            }}
          >
            この記録を削除
          </button>
        </Section>
      </Page>
      <BottomBar
        onBack={() => goStep(3)}
        backLabel="STEP3へ"
        onNext={() => {
          update((e) => ({ ...e, status: 'done' }));
          showToast('保存しました');
          navigate({ name: 'home' });
        }}
        nextLabel="完了して保存"
      />
    </>
  );
}
