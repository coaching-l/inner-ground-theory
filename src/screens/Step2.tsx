import { useMemo, useState } from 'react';
import { STEP2_COPY } from '../content/app';
import { DOMAIN_BY_ID, DOMAIN_GROUPS, DOMAINS, MAX_DOMAINS, type DomainId } from '../content/domains';
import { SIGNS, type Sign } from '../content/signs';
import { BottomBar, Page, StepHeading, StepNav, TopBar } from '../components/layout';
import { Disclosure, Field, Notice, QuestionList, Section } from '../components/ui';
import { suggestDomains } from '../lib/suggest';
import { pick, splitQuestions, toneOf } from '../lib/tone';
import type { Step2Data } from '../lib/types';
import type { EntryScreenProps } from './types';

function SignList(props: { signs: Sign[]; checked: string[]; onToggle: (id: string) => void }) {
  return (
    <ul className="checklist">
      {props.signs.map((s) => {
        const on = props.checked.includes(s.id);
        return (
          <li key={s.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              className={`check ${on ? 'is-on' : ''}`}
              onClick={() => props.onToggle(s.id)}
            >
              <span className="check-box" aria-hidden="true">
                {on ? '✓' : ''}
              </span>
              <span>{s.text}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function Step2({ entry, update, goStep, onExit }: EntryScreenProps) {
  const data = entry.step2;
  const set = (patch: Partial<Step2Data>) => update((e) => ({ ...e, step2: { ...e.step2, ...patch } }));
  const [limitMsg, setLimitMsg] = useState(false);

  const suggestions = useMemo(() => suggestDomains(entry.step1, data.signs), [entry.step1, data.signs]);
  const tone = toneOf(entry.step1);

  // 出来事の種類に合うサインを先に出す。もう一方は「〜も見る」にたたむ（両方ある・未選択なら両方出す）
  const signGroups = [
    { key: 'tense', title: STEP2_COPY.signGroups.tense, signs: SIGNS.filter((s) => s.group === 'tense') },
    { key: 'warm', title: STEP2_COPY.signGroups.warm, signs: SIGNS.filter((s) => s.group === 'warm') },
  ];
  if (tone === 'positive') signGroups.reverse();
  const folded = tone === 'negative' || tone === 'positive' ? signGroups[1] : null;
  const shown = folded ? [signGroups[0]] : signGroups;

  const toggleSign = (id: string) =>
    set({ signs: data.signs.includes(id) ? data.signs.filter((s) => s !== id) : [...data.signs, id] });

  const toggleDomain = (id: DomainId) => {
    if (data.domains.includes(id)) {
      setLimitMsg(false);
      set({ domains: data.domains.filter((d) => d !== id) });
    } else if (data.domains.length >= MAX_DOMAINS) {
      setLimitMsg(true);
    } else {
      setLimitMsg(false);
      set({ domains: [...data.domains, id] });
    }
  };

  const setAnswer = (domain: DomainId, q: string, v: string) =>
    update((e) => ({
      ...e,
      step2: { ...e.step2, answers: { ...e.step2.answers, [domain]: { ...e.step2.answers[domain], [q]: v } } },
    }));

  const setInsight = (domain: DomainId, v: string) =>
    update((e) => ({ ...e, step2: { ...e.step2, insights: { ...e.step2.insights, [domain]: v } } }));

  return (
    <>
      <TopBar onBack={onExit} backLabel="中断して保存" />
      <StepNav current={2} onJump={goStep} />
      <Page>
        <StepHeading step={2} intro={STEP2_COPY.intro} />

        <Section title={STEP2_COPY.signsLabel} hint={STEP2_COPY.signsHint}>
          {shown.map((g) => (
            <div key={g.key} className="sign-group">
              <p className="chip-caption">{g.title}</p>
              <SignList signs={g.signs} checked={data.signs} onToggle={toggleSign} />
            </div>
          ))}
          {folded && (
            <Disclosure
              summary={`${folded.title}も見る`}
              defaultOpen={folded.signs.some((s) => data.signs.includes(s.id))}
            >
              <SignList signs={folded.signs} checked={data.signs} onToggle={toggleSign} />
            </Disclosure>
          )}
        </Section>

        <Section title={STEP2_COPY.candidatesLabel}>
          {suggestions.length === 0 ? (
            <p className="muted">{STEP2_COPY.candidatesEmpty}</p>
          ) : (
            <ul className="candidates">
              {suggestions.map((s) => {
                const d = DOMAIN_BY_ID[s.domain];
                const on = data.domains.includes(s.domain);
                return (
                  <li key={s.domain} className={`candidate ${on ? 'is-on' : ''}`}>
                    <div className="candidate-head">
                      <span className="domain-no">{d.no}</span>
                      <div>
                        <p className="candidate-name">{d.name}</p>
                        <p className="candidate-lead">{d.lead}</p>
                      </div>
                    </div>
                    <ul className="reasons">
                      {s.reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className={`btn btn-small ${on ? 'btn-selected' : 'btn-outline'}`}
                      aria-pressed={on}
                      onClick={() => toggleDomain(s.domain)}
                    >
                      {on ? '✓ 選択中' : 'この領域を見てみる'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <Disclosure summary={STEP2_COPY.allDomainsLabel} defaultOpen={suggestions.length === 0}>
            {DOMAIN_GROUPS.map((g) => (
              <div key={g.id} className="domain-group">
                <p className="domain-group-title">
                  {g.id}．{g.title}
                </p>
                <ul className="domain-list">
                  {DOMAINS.filter((d) => d.group === g.id).map((d) => {
                    const on = data.domains.includes(d.id);
                    return (
                      <li key={d.id}>
                        <button
                          type="button"
                          className={`domain-row ${on ? 'is-on' : ''}`}
                          aria-pressed={on}
                          onClick={() => toggleDomain(d.id)}
                        >
                          <span className="domain-no">{d.no}</span>
                          <span className="domain-row-text">
                            <strong>{d.name}</strong>
                            <span>{d.lead}</span>
                          </span>
                          <span className="domain-row-mark" aria-hidden="true">
                            {on ? '✓' : '＋'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </Disclosure>

          <p className="selection-count" aria-live="polite">
            選択中：
            {data.domains.length ? data.domains.map((id) => DOMAIN_BY_ID[id].name).join('、') : 'なし'}
            （最大{MAX_DOMAINS}つ）
          </p>
          {limitMsg && (
            <Notice tone="gold">
              一度に扱うのは{MAX_DOMAINS}領域までにしましょう。ほかを選びたいときは、どちらかを外してください。
            </Notice>
          )}
        </Section>

        {data.domains.length > 0 && (
          <Section title={STEP2_COPY.exploreLabel} hint={STEP2_COPY.exploreHint}>
            {data.domains.map((id) => {
              const d = DOMAIN_BY_ID[id];
              const answers = data.answers[id] ?? {};
              const { featured, more } = splitQuestions(
                { negative: d.featured, positive: d.positive, extra: d.more },
                tone,
              );
              return (
                <article key={id} className="domain-card">
                  <header className="domain-card-head">
                    <span className="domain-no">{d.no}</span>
                    <div>
                      <h3 className="domain-card-name">{d.name}</h3>
                      <p className="domain-card-lead">{d.lead}</p>
                    </div>
                  </header>
                  <p className="domain-card-summary">{d.summary}</p>
                  <Disclosure summary="くわしく">
                    {d.detail.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </Disclosure>
                  <QuestionList questions={featured} answers={answers} onChange={(q, v) => setAnswer(id, q, v)} />
                  {more.length > 0 && (
                    <Disclosure summary="ほかの問い" defaultOpen={more.some((q) => answers[q]?.trim())}>
                      <QuestionList questions={more} answers={answers} onChange={(q, v) => setAnswer(id, q, v)} />
                    </Disclosure>
                  )}
                  <Field
                    label={STEP2_COPY.insightLabel}
                    value={data.insights[id] ?? ''}
                    onChange={(v) => setInsight(id, v)}
                    placeholder={pick(STEP2_COPY.insightPlaceholder, tone)}
                  />
                </article>
              );
            })}
          </Section>
        )}
      </Page>
      <BottomBar onBack={() => goStep(1)} backLabel="STEP1へ" onNext={() => goStep(3)} nextLabel="STEP3へ" />
    </>
  );
}
