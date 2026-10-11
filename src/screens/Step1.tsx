import { STEP1_COPY } from '../content/app';
import {
  EMOTIONS,
  INTENSITY_LABELS,
  TENSE_BODY_REACTIONS,
  TENSE_EMOTIONS,
  WARM_BODY_REACTIONS,
  WARM_EMOTIONS,
} from '../content/reactions';
import { BottomBar, Page, StepHeading, StepNav, TopBar } from '../components/layout';
import { AddChip, ChipGroup, Field, Section } from '../components/ui';
import { levelOf, orderEmotions, setLevel } from '../lib/intensity';
import { pick, toneOf } from '../lib/tone';
import type { Step1Data, Tone } from '../lib/types';
import type { EntryScreenProps } from './types';

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** 見出しつきのチップのまとまり（「ざわつく・重い」「あたたかい・明るい」など） */
function ChipGroups(props: {
  label: string;
  groups: { caption: string; options: string[] }[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <div className="chip-groups">
      {props.groups
        .filter((g) => g.options.length > 0)
        .map((g) => (
          <div key={g.caption} className="chip-group">
            <p className="chip-caption">{g.caption}</p>
            <ChipGroup
              label={`${props.label}（${g.caption}）`}
              options={g.options}
              selected={props.selected}
              onToggle={props.onToggle}
            />
          </div>
        ))}
    </div>
  );
}

/** 刺激（出来事・解釈）と反応（感情・身体・思考・行動・願い）。quick のときは最小限の項目だけ出す */
export function Step1Fields(props: { data: Step1Data; set: (patch: Partial<Step1Data>) => void; quick?: boolean }) {
  const { data, set, quick } = props;
  const tone = toneOf(data);
  // うれしかった出来事のときは、あたたかい・明るいほうを先に出す
  const warmFirst = <T,>(tense: T, warm: T): T[] => (tone === 'positive' ? [warm, tense] : [tense, warm]);
  const emotionGroups = [
    ...warmFirst(
      { caption: STEP1_COPY.emotionGroups.tense, options: TENSE_EMOTIONS },
      { caption: STEP1_COPY.emotionGroups.warm, options: WARM_EMOTIONS },
    ),
    { caption: STEP1_COPY.emotionGroups.custom, options: data.emotions.filter((e) => !EMOTIONS.includes(e)) },
  ];
  const bodyGroups = warmFirst(
    { caption: STEP1_COPY.bodyGroups.tense, options: TENSE_BODY_REACTIONS },
    { caption: STEP1_COPY.bodyGroups.warm, options: WARM_BODY_REACTIONS },
  );
  const rows = orderEmotions(data.emotions, tone);

  return (
    <>
      {!quick && (
        <Section>
          <div className="field">
            <p className="field-label">{STEP1_COPY.toneLabel}</p>
            <p className="field-hint">{STEP1_COPY.toneHint}</p>
            <div className="segmented segmented-stack" role="radiogroup" aria-label={STEP1_COPY.toneLabel}>
              {STEP1_COPY.toneOptions.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={data.tone === o.id}
                  className={data.tone === o.id ? 'is-on' : ''}
                  onClick={() => set({ tone: data.tone === o.id ? null : (o.id as Tone) })}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </Section>
      )}

      <Section title="刺激　何が起きたか">
        <Field
          label={STEP1_COPY.eventLabel}
          hint={STEP1_COPY.eventHint}
          value={data.event}
          onChange={(event) => set({ event })}
          placeholder={pick(STEP1_COPY.eventPlaceholder, tone)}
          rows={3}
        />
        {!quick && (
          <Field
            label={STEP1_COPY.interpretationLabel}
            hint={STEP1_COPY.interpretationHint}
            value={data.interpretation}
            onChange={(interpretation) => set({ interpretation })}
            placeholder={pick(STEP1_COPY.interpretationPlaceholder, tone)}
          />
        )}
      </Section>

      <Section title="反応　そのときの自分">
        <div className="field">
          <p className="field-label">{STEP1_COPY.emotionLabel}</p>
          <p className="field-hint">{STEP1_COPY.emotionHint}</p>
          <ChipGroups
            label={STEP1_COPY.emotionLabel}
            groups={emotionGroups}
            selected={data.emotions}
            onToggle={(e) =>
              set(
                data.emotions.includes(e)
                  ? { emotions: toggle(data.emotions, e), intensities: setLevel(data.intensities, e, null) }
                  : { emotions: orderEmotions(toggle(data.emotions, e), tone) },
              )
            }
          />
          <AddChip
            placeholder="ほかの感情を書き足す"
            onAdd={(e) => !data.emotions.includes(e) && set({ emotions: orderEmotions([...data.emotions, e], tone) })}
          />
        </div>

        {!quick && rows.length > 0 && (
          <div className="field">
            <p className="field-label">{STEP1_COPY.intensityLabel}</p>
            <p className="field-hint">{STEP1_COPY.intensityHint}</p>
            <p className="scale-legend" aria-hidden="true">
              <span>{INTENSITY_LABELS[1]}</span>
              <span>{INTENSITY_LABELS[5]}</span>
            </p>
            <ul className="intensity-list">
              {rows.map((emotion) => {
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
            <ChipGroups
              label={STEP1_COPY.bodyLabel}
              groups={bodyGroups}
              selected={data.body}
              onToggle={(b) => set({ body: toggle(data.body, b) })}
            />
          </div>
        )}

        <Field
          label={STEP1_COPY.thoughtsLabel}
          value={data.thoughts}
          onChange={(thoughts) => set({ thoughts })}
          placeholder={pick(STEP1_COPY.thoughtsPlaceholder, tone)}
        />

        {!quick && (
          <>
            <Field
              label={pick(STEP1_COPY.actionLabel, tone)}
              value={data.action}
              onChange={(action) => set({ action })}
              placeholder={pick(STEP1_COPY.actionPlaceholder, tone)}
            />
            <Field
              label={pick(STEP1_COPY.wishLabel, tone)}
              value={data.wish}
              onChange={(wish) => set({ wish })}
              placeholder={pick(STEP1_COPY.wishPlaceholder, tone)}
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
