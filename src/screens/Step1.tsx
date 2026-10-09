import { STEP1_COPY } from '../content/app';
import { BODY_REACTIONS, EMOTIONS, INTENSITY_LABELS } from '../content/reactions';
import { BottomBar, Page, StepHeading, StepNav, TopBar } from '../components/layout';
import { AddChip, ChipGroup, Field, Section } from '../components/ui';
import { levelOf, orderEmotions, setLevel } from '../lib/intensity';
import type { Step1Data } from '../lib/types';
import type { EntryScreenProps } from './types';

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** 刺激（出来事・解釈）と反応（感情・身体・思考・行動・願い）。quick のときは最小限の項目だけ出す */
export function Step1Fields(props: { data: Step1Data; set: (patch: Partial<Step1Data>) => void; quick?: boolean }) {
  const { data, set, quick } = props;
  const customEmotions = data.emotions.filter((e) => !EMOTIONS.includes(e));

  return (
    <>
      <Section title="刺激　何が起きたか">
        <Field
          label={STEP1_COPY.eventLabel}
          hint={STEP1_COPY.eventHint}
          value={data.event}
          onChange={(event) => set({ event })}
          placeholder={STEP1_COPY.eventPlaceholder}
          rows={3}
        />
        {!quick && (
          <Field
            label={STEP1_COPY.interpretationLabel}
            hint={STEP1_COPY.interpretationHint}
            value={data.interpretation}
            onChange={(interpretation) => set({ interpretation })}
            placeholder={STEP1_COPY.interpretationPlaceholder}
          />
        )}
      </Section>

      <Section title="反応　そのときの自分">
        <div className="field">
          <p className="field-label">{STEP1_COPY.emotionLabel}</p>
          <p className="field-hint">{STEP1_COPY.emotionHint}</p>
          <ChipGroup
            label={STEP1_COPY.emotionLabel}
            options={[...EMOTIONS, ...customEmotions]}
            selected={data.emotions}
            onToggle={(e) =>
              set(
                data.emotions.includes(e)
                  ? { emotions: toggle(data.emotions, e), intensities: setLevel(data.intensities, e, null) }
                  : { emotions: orderEmotions(toggle(data.emotions, e)) },
              )
            }
          />
          <AddChip
            placeholder="ほかの感情を書き足す"
            onAdd={(e) => !data.emotions.includes(e) && set({ emotions: orderEmotions([...data.emotions, e]) })}
          />
        </div>

        {!quick && data.emotions.length > 0 && (
          <div className="field">
            <p className="field-label">{STEP1_COPY.intensityLabel}</p>
            <p className="field-hint">{STEP1_COPY.intensityHint}</p>
            <p className="scale-legend" aria-hidden="true">
              <span>{INTENSITY_LABELS[1]}</span>
              <span>{INTENSITY_LABELS[5]}</span>
            </p>
            <ul className="intensity-list">
              {data.emotions.map((emotion) => {
                const level = levelOf(data.intensities, emotion);
                return (
                  <li key={emotion} className="intensity-row">
                    <p className="intensity-head">
                      <span className="intensity-name">{emotion}</span>
                      <span className={`intensity-value ${level ? '' : 'is-empty'}`}>
                        {level ? INTENSITY_LABELS[level] : '未選択'}
                      </span>
                    </p>
                    <div className="scale scale-compact" role="radiogroup" aria-label={`${emotion}の強さ`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={level === n}
                          aria-label={INTENSITY_LABELS[n]}
                          className={`scale-item ${level === n ? 'is-on' : ''}`}
                          onClick={() => set({ intensities: setLevel(data.intensities, emotion, level === n ? null : n) })}
                        >
                          <span className="scale-dot" style={{ ['--size' as string]: `${8 + n * 3}px` }} />
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!quick && (
          <div className="field">
            <p className="field-label">{STEP1_COPY.bodyLabel}</p>
            <ChipGroup
              label={STEP1_COPY.bodyLabel}
              options={BODY_REACTIONS}
              selected={data.body}
              onToggle={(b) => set({ body: toggle(data.body, b) })}
            />
          </div>
        )}

        <Field
          label={STEP1_COPY.thoughtsLabel}
          value={data.thoughts}
          onChange={(thoughts) => set({ thoughts })}
          placeholder={STEP1_COPY.thoughtsPlaceholder}
        />

        {!quick && (
          <>
            <Field
              label={STEP1_COPY.actionLabel}
              value={data.action}
              onChange={(action) => set({ action })}
              placeholder={STEP1_COPY.actionPlaceholder}
            />
            <Field
              label={STEP1_COPY.wishLabel}
              value={data.wish}
              onChange={(wish) => set({ wish })}
              placeholder={STEP1_COPY.wishPlaceholder}
            />
          </>
        )}
      </Section>
    </>
  );
}

export function Step1({ entry, update, goStep, onExit }: EntryScreenProps) {
  const set = (patch: Partial<Step1Data>) => update((e) => ({ ...e, step1: { ...e.step1, ...patch } }));
  return (
    <>
      <TopBar onBack={onExit} backLabel="中断して保存" />
      <StepNav current={1} onJump={goStep} />
      <Page>
        <StepHeading step={1} intro={STEP1_COPY.intro} />
        <Step1Fields data={entry.step1} set={set} />
      </Page>
      <BottomBar onNext={() => goStep(2)} nextLabel="STEP2へ" />
    </>
  );
}
