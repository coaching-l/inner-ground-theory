import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export function TextArea(props: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [props.value]);
  return (
    <textarea
      ref={ref}
      id={props.id}
      className="textarea"
      rows={props.rows ?? 2}
      value={props.value}
      placeholder={props.placeholder}
      aria-label={props.ariaLabel}
      autoFocus={props.autoFocus}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}

export function Field(props: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {props.label}
      </label>
      {props.hint && <p className="field-hint">{props.hint}</p>}
      <TextArea id={id} value={props.value} onChange={props.onChange} placeholder={props.placeholder} rows={props.rows} />
    </div>
  );
}

export function Section(props: { title?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`section ${props.className ?? ''}`}>
      {props.title && <h2 className="section-title">{props.title}</h2>}
      {props.hint && <p className="field-hint">{props.hint}</p>}
      {props.children}
    </section>
  );
}

export function ChipGroup(props: {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  label: string;
}) {
  return (
    <div className="chips" role="group" aria-label={props.label}>
      {props.options.map((opt) => {
        const on = props.selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            className={`chip ${on ? 'is-on' : ''}`}
            aria-pressed={on}
            onClick={() => props.onToggle(opt)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/** 文字で追加できるチップ（感情の書き足しなど） */
export function AddChip(props: { onAdd: (value: string) => void; placeholder: string }) {
  const [value, setValue] = useState('');
  const submit = () => {
    const v = value.trim();
    if (v) props.onAdd(v);
    setValue('');
  };
  return (
    <div className="add-chip">
      <input
        className="input"
        value={value}
        placeholder={props.placeholder}
        aria-label={props.placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button type="button" className="btn btn-small btn-outline" onClick={submit} disabled={!value.trim()}>
        追加
      </button>
    </div>
  );
}

/** タップすると回答欄が開く問いのリスト */
export function QuestionList(props: {
  questions: string[];
  answers: Record<string, string>;
  onChange: (question: string, value: string) => void;
}) {
  const [open, setOpen] = useState<string[]>(() => props.questions.filter((q) => props.answers[q]?.trim()));
  return (
    <ul className="questions">
      {props.questions.map((q) => {
        const isOpen = open.includes(q);
        const answered = Boolean(props.answers[q]?.trim());
        return (
          <li key={q} className={`question ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="question-toggle"
              aria-expanded={isOpen}
              onClick={() => setOpen((o) => (o.includes(q) ? o.filter((x) => x !== q) : [...o, q]))}
            >
              <span className={`question-mark ${answered ? 'is-done' : ''}`} aria-hidden="true">
                {answered ? '✓' : 'Q'}
              </span>
              <span className="question-text">{q}</span>
            </button>
            {isOpen && (
              <TextArea
                value={props.answers[q] ?? ''}
                onChange={(v) => props.onChange(q, v)}
                ariaLabel={q}
                autoFocus={!answered}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Disclosure(props: { summary: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="disclosure" open={props.defaultOpen}>
      <summary>{props.summary}</summary>
      <div className="disclosure-body">{props.children}</div>
    </details>
  );
}

export function Notice(props: { tone?: 'gold' | 'navy' | 'plain'; title?: string; children: ReactNode }) {
  return (
    <div className={`notice notice-${props.tone ?? 'navy'}`}>
      {props.title && <p className="notice-title">{props.title}</p>}
      {props.children}
    </div>
  );
}
