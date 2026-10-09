// STEP2「サインから領域を選ぶ」で使うデータ
//
// signs:    利用者がチェックする「当てはまるサイン」。
//           weights は「どの領域の手がかりになるか」と、その強さ（2=主、1=副）。
// keywords: STEP1で書いた言葉の中にこの表現があれば、その領域を候補に加える。
//           正規表現で書いています。reason は候補の理由として表示される文です。
//
// どちらも診断ではなく「仮説の手がかり」です。

import type { DomainId } from './domains';

export interface Sign {
  id: string;
  text: string;
  weights: Partial<Record<DomainId, number>>;
}

export const SIGNS: Sign[] = [
  { id: 'value-hurt', text: '大切にしていることが、軽く扱われた気がした', weights: { values: 2 } },
  { id: 'not-me', text: '自分らしくない選択をしている気がした', weights: { values: 2, selfDetermination: 1 } },
  { id: 'want-recognized', text: '本当は、認めてほしかった・わかってほしかった', weights: { needs: 2 } },
  { id: 'want-safe', text: '安心したかった・休みたかった', weights: { needs: 2, resources: 1 } },
  { id: 'should', text: '「〜すべき」「〜でなければ」と思った', weights: { beliefs: 2 } },
  { id: 'as-always', text: '「やっぱり自分は〇〇な人間だ」と思った', weights: { selfConcept: 2 } },
  { id: 'compare', text: '誰かと比べて、自分は足りないと感じた', weights: { inferiority: 2 } },
  { id: 'prove', text: '認められるために、がんばりすぎている気がする', weights: { inferiority: 2, needs: 1 } },
  { id: 'emotion-swing', text: '感情を抑え込んだ、または爆発させてしまった', weights: { emotions: 2 } },
  { id: 'body', text: '身体が強く反応した（緊張・胸の苦しさなど）', weights: { emotions: 2 } },
  { id: 'no-choice', text: '「仕方ない」「やらされている」と感じた', weights: { selfDetermination: 2 } },
  { id: 'avoid', text: '先延ばし・回避・衝動的な行動をした', weights: { behavior: 2 } },
  { id: 'carry', text: '相手の期待や機嫌を背負っている気がした', weights: { relationships: 2 } },
  { id: 'cant-ask', text: '頼る・断る・任せることができなかった', weights: { relationships: 2, beliefs: 1 } },
  { id: 'no-room', text: '時間や気力に余裕がなかった', weights: { resources: 2 } },
  { id: 'no-support', text: '頼れる人や使えるものがない、と感じた', weights: { resources: 2, relationships: 1 } },
];

export interface KeywordHint {
  domain: DomainId;
  pattern: RegExp;
  reason: string;
}

export const KEYWORD_HINTS: KeywordHint[] = [
  {
    domain: 'beliefs',
    pattern: /べき|ねばならない|なければ(?!よかった)|なきゃ|ないと(いけない|ダメ|だめ)|当たり前|当然/,
    reason: '「〜べき」「〜なければ」「当然」のような表現がありました',
  },
  {
    domain: 'selfConcept',
    pattern: /(やっぱり|どうせ)(自分|私|わたし|僕|俺)|向いてない|向いていない|(ダメ|だめ)な(人間|自分)|いつもこう/,
    reason: '「やっぱり自分は」「どうせ自分は」のような、自分を説明する言葉がありました',
  },
  {
    domain: 'inferiority',
    pattern: /比べ|負け|劣って|足りない|追いつけ|みたいにできない|証明/,
    reason: '比較や「足りない」という感覚を表す言葉がありました',
  },
  {
    domain: 'selfDetermination',
    pattern: /仕方(が)?ない|しかたない|やらされ|やるしかない|選べない|言われたから/,
    reason: '「仕方ない」「やらされている」のような表現がありました',
  },
  {
    domain: 'behavior',
    pattern: /先延ばし|後回し|あとまわし|避け|逃げ|サボ|SNS|スマホ|手につかない|動けな/,
    reason: '先延ばしや回避など、行動のパターンを表す言葉がありました',
  },
  {
    domain: 'relationships',
    pattern: /期待|機嫌|断れ|頼れ|任せられ|嫌われ|気を(遣|使|つか)|顔色/,
    reason: '相手の期待や機嫌、頼る・断ることに関する言葉がありました',
  },
  {
    domain: 'needs',
    pattern: /(認め|わか|分か|聞い|任せ|尊重し|見)てほしかった|安心したかった|休みたい|居場所/,
    reason: '「〜してほしかった」のような、求めていたことを表す言葉がありました',
  },
  {
    domain: 'values',
    pattern: /大切|大事にし|許せない|譲れない|筋が通らない|理不尽|誠実/,
    reason: '大切にしていること・譲れないことを表す言葉がありました',
  },
  {
    domain: 'resources',
    pattern: /余裕がない|時間がない|疲れ|頼れる人がいない|(一人|ひとり)で(抱え|やる|なんとか)/,
    reason: '余裕のなさや、ひとりで抱えていることを表す言葉がありました',
  },
];

/** 感情の強さがこの値以上なら「感情」を候補に加える（5段階） */
export const STRONG_EMOTION_THRESHOLD = 4;

/** 候補として表示する領域の数 */
export const SUGGESTION_COUNT = 3;
