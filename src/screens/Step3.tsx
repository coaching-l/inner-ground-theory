import { useId } from 'react';
import { STEP3_COPY } from '../content/app';
import { BottomBar, Page, StepHeading, StepNav, TopBar } from '../components/layout';
import { Field, Notice, QuestionList, Section, TextArea } from '../components/ui';
import { understandingText } from '../lib/compose';
import type { Step3Data } from '../lib/types';
import type { EntryScreenProps } from './types';

export function Step3({ entry, update, goStep, onExit }: EntryScreenProps) {
  const data = entry.step3;
  const set = (patch: Partial<Step3Data>) => update((e) => ({ ...e, step3: { ...e.step3, ...patch } }));
  const setAnswer = (q: string, v: string) => set({ answers: { ...data.answers, [q]: v } });
  const sentenceId = useId();
  const acceptId = useId();

  return (
    <>
      <TopBar onBack={onExit} backLabel="中断して保存" />
      <StepNav current={3} onJump={goStep} />
      <Page>
        <StepHeading step={3} intro={STEP3_COPY.intro} />

        <Section title={STEP3_COPY.understandTitle}>
          <Field
            label={STEP3_COPY.protectLabel}
            value={data.protect}
            onChange={(protect) => set({ protect })}
            placeholder={STEP3_COPY.protectPlaceholder}
          />
          <QuestionList questions={STEP3_COPY.understandQuestions} answers={data.answers} onChange={setAnswer} />

          <div className="field sentence-field">
            <label className="field-label" htmlFor={sentenceId}>
              {STEP3_COPY.sentenceLabel}
            </label>
            <p className="field-hint">{STEP3_COPY.sentenceHint}</p>
            <TextArea
              id={sentenceId}
              value={understandingText(entry)}
              onChange={(understanding) => set({ understanding, understandingEdited: true })}
              rows={4}
              placeholder="ここまでの回答が増えると、下書きができます"
            />
            {data.understandingEdited && (
              <button
                type="button"
                className="btn btn-small btn-ghost"
                onClick={() => {
                  if (window.confirm('書き直した内容を消して、回答から下書きを作り直しますか？')) {
                    set({ understanding: '', understandingEdited: false });
                  }
                }}
              >
                {STEP3_COPY.regenerate}
              </button>
            )}
          </div>
        </Section>

        <Section title={STEP3_COPY.acceptTitle}>
          <p className="lead">{STEP3_COPY.acceptIntro}</p>
          <QuestionList questions={STEP3_COPY.acceptQuestions} answers={data.answers} onChange={setAnswer} />

          <div className="field">
            <p className="field-label">{STEP3_COPY.acceptChoiceLabel}</p>
            <div className="segmented" role="radiogroup" aria-label={STEP3_COPY.acceptChoiceLabel}>
              {(
                [
                  ['accept', STEP3_COPY.acceptChoiceYes],
                  ['notyet', STEP3_COPY.acceptChoiceNotYet],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={data.acceptMode === mode}
                  className={data.acceptMode === mode ? 'is-on' : ''}
                  onClick={() => set({ acceptMode: data.acceptMode === mode ? null : mode })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {data.acceptMode === 'accept' && (
            <div className="accept-sentence">
              <label htmlFor={acceptId}>{STEP3_COPY.acceptPrefix}</label>
              <TextArea
                id={acceptId}
                value={data.acceptText}
                onChange={(acceptText) => set({ acceptText })}
                placeholder={STEP3_COPY.acceptPlaceholder}
              />
              <p>{STEP3_COPY.acceptSuffix}</p>
            </div>
          )}

          {data.acceptMode === 'notyet' && (
            <>
              <Notice tone="gold" title={STEP3_COPY.notYetSentence}>
                <p>{STEP3_COPY.notYetMessage}</p>
              </Notice>
              <Field
                label={STEP3_COPY.notYetNoteLabel}
                value={data.notYetNote}
                onChange={(notYetNote) => set({ notYetNote })}
              />
            </>
          )}
        </Section>
      </Page>
      <BottomBar onBack={() => goStep(2)} backLabel="STEP2へ" onNext={() => goStep(4)} nextLabel="まとめへ" />
    </>
  );
}
