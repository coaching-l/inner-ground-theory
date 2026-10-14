import { useEffect, useId, useState } from 'react';
import { APP_NAME, SHEET_COPY, STEP1_COPY, SUMMARY_COPY } from '../content/app';
import { DOMAIN_BY_ID } from '../content/domains';
import { INTENSITY_LABELS } from '../content/reactions';
import { BottomBar, Page, StepNav, TopBar } from '../components/layout';
import { showToast } from '../components/Toast';
import { Field, Notice, Section } from '../components/ui';
import { copyText, canShare, shareText } from '../lib/clipboard';
import { levelOf, orderEmotions } from '../lib/intensity';
import { navigate } from '../lib/router';
import { acceptanceSentence, buildSessionSheet, displayName, formatDate, NAME_MAX_LENGTH, printTitle, understandingText } from '../lib/compose';
import { guidanceToneOf, pick } from '../lib/tone';
import type { Feeling, SummaryData, Tone } from '../lib/types';
import type { EntryScreenProps } from './types';

export function Summary({
  entry,
  update,
  goStep,
  onExit,
  onDelete,
  name,
  onNameChange,
}: EntryScreenProps & { onDelete: () => void; name: string; onNameChange: (name: string) => void }) {
  const { step1, step2, step3, summary } = entry;
  const nameId = useId();
  const shownName = displayName(name);
  const set = (patch: Partial<SummaryData>) => update((e) => ({ ...e, summary: { ...e.summary, ...patch } }));
  const setTone = (t: Tone | null) => update((e) => ({ ...e, step1: { ...e.step1, tone: t } }));
  // この先の案内は、本人が選んだ種類で決める
  const guidance = guidanceToneOf(step1);
  // 種類を選ばないまま来たときだけ尋ねる（選んだあとも、この画面にいるあいだは選び直せるよう残す）
  const [askTone] = useState(() => step1.tone === null);
  const heavyPositive = guidance === 'positive' && summary.feeling === 'heavy';
  // うれしかった出来事で「しんどくなった」ときは、コーチと話したいことの欄もセッションへつなぐ言い方にする
  const noteTone = heavyPositive ? 'negative' : guidance;
  const understanding = understandingText(entry);
  const acceptance = acceptanceSentence(entry);

  const copySheet = async () => {
    const ok = await copyText(buildSessionSheet(entry, name));
    showToast(ok ? 'セッション準備シートをコピーしました' : 'コピーできませんでした');
  };

  // 名前があるときだけ、印刷のあいだページの題名を変える（ブラウザが PDF のファイル名に使う）
  const fileTitle = printTitle(entry, name);
  useEffect(() => {
    if (!fileTitle) return;
    let saved: string | null = null;
    const before = () => {
      if (saved === null) saved = document.title;
      document.title = fileTitle;
    };
    const after = () => {
      if (saved !== null) document.title = saved;
      saved = null;
    };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      after();
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, [fileTitle]);

  return (
    <>
      <TopBar onBack={onExit} backLabel="ホーム" />
      <StepNav current={4} onJump={goStep} />
      <Page>
        <div className="step-heading no-print">
          <p className="eyebrow">まとめ</p>
          <h1 className="step-title">今回の内省カード</h1>
          <p className="lead">{pick(SUMMARY_COPY.lead, guidance)}</p>
        </div>

        {askTone && (
          <Section title={SUMMARY_COPY.toneAskLabel} hint={SUMMARY_COPY.toneAskHint} className="no-print">
            <div className="segmented segmented-stack" role="radiogroup" aria-label={SUMMARY_COPY.toneAskLabel}>
              {STEP1_COPY.toneOptions.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={step1.tone === o.id}
                  className={step1.tone === o.id ? 'is-on' : ''}
                  onClick={() => setTone(step1.tone === o.id ? null : (o.id as Tone))}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Section>
        )}

        <article className="card print-area">
          <header className="card-head">
            <p className="card-brand">{APP_NAME}</p>
            <p className="card-date">{formatDate(entry.createdAt)}</p>
            {shownName && <p className="card-name">{shownName}</p>}
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
                      {orderEmotions(step1.emotions, step1.tone).map((e) => {
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
              <p className="card-quote-label">{pick(SHEET_COPY.nextSign, guidance)}</p>
              <p className="prewrap">{summary.nextSign}</p>
            </div>
          )}
        </article>

        <Section className="no-print">
          <Field
            label={pick(SUMMARY_COPY.nextSignLabel, guidance)}
            hint={pick(SUMMARY_COPY.nextSignHint, guidance)}
            value={summary.nextSign}
            onChange={(nextSign) => set({ nextSign })}
            placeholder={pick(SUMMARY_COPY.nextSignPlaceholder, guidance)}
          />
          <Field
            label={pick(SUMMARY_COPY.coachNoteLabel, noteTone)}
            hint={pick(SUMMARY_COPY.coachNoteHint, noteTone)}
            value={summary.coachNote}
            onChange={(coachNote) => set({ coachNote })}
            placeholder={heavyPositive ? SUMMARY_COPY.coachNotePlaceholderHeavy : pick(SUMMARY_COPY.coachNotePlaceholder, noteTone)}
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
            </Notice>
          )}
        </Section>

        <Section className="no-print">
          <Notice
            tone={guidance === 'positive' && !heavyPositive ? 'gold' : 'navy'}
            title={heavyPositive ? SUMMARY_COPY.bridgePositiveHeavyTitle : pick(SUMMARY_COPY.bridgeTitle, guidance)}
          >
            <p>
              {heavyPositive
                ? SUMMARY_COPY.bridgePositiveHeavy
                : guidance === 'positive' && step3.acceptMode === 'notyet'
                  ? SUMMARY_COPY.bridgePositiveNotYet
                  : pick(SUMMARY_COPY.bridge, guidance)}
            </p>
          </Notice>
          <div className="field name-field">
            <label className="field-label" htmlFor={nameId}>
              {SUMMARY_COPY.nameLabel}
            </label>
            <p className="field-hint" id={`${nameId}-hint`}>
              {SUMMARY_COPY.nameHint}
            </p>
            <input
              id={nameId}
              aria-describedby={`${nameId}-hint`}
              className="input"
              type="text"
              // ブラウザの自動入力の記録に名前を残さない（「すべての記録を削除」で消えなくなるため）
              autoComplete="off"
              maxLength={NAME_MAX_LENGTH}
              value={name}
              placeholder={SUMMARY_COPY.namePlaceholder}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          <div className="actions">
            <button type="button" className="btn btn-outline" onClick={copySheet}>
              セッション準備シートをコピー
            </button>
            {canShare() && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => shareText(`${APP_NAME}｜セッション準備シート`, buildSessionSheet(entry, name))}
              >
                共有する
              </button>
            )}
            <button type="button" className="btn btn-outline" onClick={() => window.print()}>
              印刷・PDFで保存
            </button>
          </div>
          <p className="send-note">{SUMMARY_COPY.sendNote}</p>
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
