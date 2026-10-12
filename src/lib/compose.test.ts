import { describe, expect, it } from 'vitest';
import { acceptanceSentence, buildSessionSheet, clean, draftUnderstanding, joinJa, understandingText } from './compose';
import { createEntry } from './entry';
import type { Entry } from './types';

function sample(): Entry {
  const e = createEntry('exploring', new Date('2026-10-09T10:00:00+09:00'));
  e.step1 = {
    ...e.step1,
    event: '会議で企画に「詰めが甘い」と言われた。',
    interpretation: '能力を否定されたと感じた',
    emotions: ['悔しさ', '不安'],
    intensities: { 悔しさ: 4, 不安: 2 },
    body: ['胸が苦しい・ざわざわする'],
    thoughts: 'やっぱり自分は詰めが甘い',
  };
  e.step2 = {
    signs: ['should'],
    domains: ['beliefs', 'selfConcept'],
    answers: { beliefs: { 'この状況で、何を当然だと思っていますか': '企画は最初から完璧であるべき' } },
    insights: { beliefs: '「最初から完璧でなければ」という前提があった' },
  };
  e.step3 = { ...e.step3, protect: 'チームからの信頼', acceptMode: 'accept', acceptText: '期待に応えようとして、自分を追い込みやすい' };
  return e;
}

describe('clean / joinJa', () => {
  it('文末の句点を取り除く', () => {
    expect(clean(' 言われた。 ')).toBe('言われた');
  });
  it('日本語らしく並べる', () => {
    expect(joinJa(['悔しさ'])).toBe('悔しさ');
    expect(joinJa(['悔しさ', '不安'])).toBe('悔しさと不安');
    expect(joinJa(['悔しさ', '不安', '焦り'])).toBe('悔しさ、不安、焦り');
  });
});

describe('draftUnderstanding', () => {
  it('回答から「つながりの一文」を組み立てる', () => {
    expect(draftUnderstanding(sample())).toBe(
      [
        '「会議で企画に「詰めが甘い」と言われた」という出来事で、私は不安と悔しさを感じた。',
        '頭の中には「やっぱり自分は詰めが甘い」という言葉が浮かんでいた。',
        'その背景には、ビリーフ（「最初から完璧でなければ」という前提があった）と自己概念が関わっていたのかもしれない。',
        'あの反応は、チームからの信頼を守ろうとしていたのだと思う。',
      ].join('\n'),
    );
  });

  it('何も書いていなければ空になる', () => {
    expect(draftUnderstanding(createEntry())).toBe('');
  });

  it('書き直した後は、書き直した文を使う', () => {
    const e = sample();
    expect(understandingText(e)).toBe(draftUnderstanding(e));
    e.step3.understandingEdited = true;
    e.step3.understanding = '自分の言葉で書いた理解';
    expect(understandingText(e)).toBe('自分の言葉で書いた理解');
  });
});

describe('acceptanceSentence', () => {
  it('受け止めてみる場合', () => {
    expect(acceptanceSentence(sample())).toBe('今の私には、期待に応えようとして、自分を追い込みやすいという側面がある。');
  });
  it('まだ受け入れられない場合も、そのまま言葉にする', () => {
    const e = sample();
    e.step3.acceptMode = 'notyet';
    expect(acceptanceSentence(e)).toBe('まだ受け入れられない。そう感じている自分がいる。');
  });
  it('未選択なら空', () => {
    expect(acceptanceSentence(createEntry())).toBe('');
  });
});

describe('buildSessionSheet', () => {
  it('ガイド第9章のA・B・Cの順にまとめ、空欄の項目は出さない', () => {
    const sheet = buildSessionSheet(sample());
    const a = sheet.indexOf('A．現在のテーマ');
    const b = sheet.indexOf('B．関係していそうな自己知識の領域');
    const c = sheet.indexOf('C．理解と受容');
    expect(a).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
    expect(sheet).toContain('感情：不安（少し）、悔しさ（強い）');
    expect(sheet).toContain('■ 今回、特に深めたい領域：ビリーフ、自己概念');
    expect(sheet).toContain('A．企画は最初から完璧であるべき');
    expect(sheet).toContain('今の私には、期待に応えようとして、自分を追い込みやすいという側面がある。');
    expect(sheet).not.toContain('本当はどうしたいと思っているか');
    expect(sheet).not.toMatch(/\n{3,}/);
  });
});

describe('うれしかった・満たされた出来事', () => {
  function warm(): Entry {
    const e = createEntry('exploring', new Date('2026-10-11T10:00:00+09:00'));
    e.step1 = {
      ...e.step1,
      tone: 'positive',
      event: '後輩から「相談してよかったです」と言われた',
      emotions: ['不安', '感謝', '喜び'],
      intensities: { 感謝: 5 },
      wish: '人の役に立てている実感',
    };
    e.step3 = { ...e.step3, protect: '人の成長に関わること', acceptMode: 'notyet' };
    e.summary = { ...e.summary, nextSign: '相手の話を最後まで聞いてから伝える', coachNote: 'うれしかった経験を分かち合いたい' };
    return e;
  }

  it('つながりの一文は「大切にしていること」の言い方になり、感情はあたたかいものから並ぶ', () => {
    const draft = draftUnderstanding(warm());
    expect(draft).toContain('私は喜び、感謝、不安を感じた。');
    expect(draft).toContain('あの気持ちは、私が人の成長に関わることを大切にしているという知らせだったのだと思う。');
  });

  it('書いた言葉に $ などの記号があっても、そのまま入れる', () => {
    const e = warm();
    e.step3.protect = '評価（$&）と$$';
    expect(draftUnderstanding(e)).toContain('私が評価（$&）と$$を大切にしている');
  });

  it('まだ受け入れられないときの一文は、どの出来事でも同じ（「受け入れる」は最終段階）', () => {
    expect(acceptanceSentence(warm())).toBe('まだ受け入れられない。そう感じている自分がいる。');
  });

  it('セッション準備シートに出来事の種類と、合う見出しを出す', () => {
    const sheet = buildSessionSheet(warm());
    expect(sheet).toContain('■ ふりかえった出来事：うれしかった・満たされた');
    expect(sheet).toContain('■ 何が満たされていたと感じるか\n人の役に立てている実感');
    expect(sheet).toContain('■ 何を大切にしていると知らせていたか');
    expect(sheet).toContain('■ 受け入れたい現在の自分\nまだ受け入れられない。そう感じている自分がいる。');
    expect(sheet).toContain('■ 繰り返していきたい考え方・動き方\n相手の話を最後まで聞いてから伝える');
    expect(sheet).toContain('■ コーチと分かち合いたいこと\nうれしかった経験を分かち合いたい');
    expect(sheet).not.toContain('次に気づきたいサイン');
    expect(sheet).toContain('感情：喜び、感謝（とても強い）、不安');
  });

  it('うれしかった出来事で「しんどくなった」ときは、コーチへの欄を「セッションで話したいこと」として渡す', () => {
    const e = warm();
    e.summary.feeling = 'heavy';
    expect(buildSessionSheet(e)).toContain('■ セッションで話したいこと\nうれしかった経験を分かち合いたい');
  });

  it('両方あるときは、シートだけ見てもわかる言い方にする', () => {
    const e = warm();
    e.step1.tone = 'mixed';
    expect(buildSessionSheet(e)).toContain('■ ふりかえった出来事：引っかかったことと、うれしかったことの両方がある');
  });

  it('引っかかった出来事では、これまでどおり「気づきたいサイン」「セッションで話したいこと」', () => {
    const e = sample();
    e.summary = { ...e.summary, nextSign: '肩に力が入ったとき', coachNote: '任せ方について' };
    const sheet = buildSessionSheet(e);
    expect(sheet).toContain('■ 次に気づきたいサイン\n肩に力が入ったとき');
    expect(sheet).toContain('■ セッションで話したいこと\n任せ方について');
  });

  it('種類を選ばず、感情から「うれしかった」と判断しただけのときは、繰り返したいこと・分かち合いたいことの見出しにしない', () => {
    const e = warm();
    e.step1.tone = null;
    e.step1.emotions = ['安心'];
    const sheet = buildSessionSheet(e);
    expect(sheet).toContain('■ 次に気づきたいサイン・繰り返していきたいこと\n相手の話を最後まで聞いてから伝える');
    expect(sheet).toContain('■ セッションで話したいこと\nうれしかった経験を分かち合いたい');
    // 問いの言い回しに合わせる見出しは、これまでどおり感情からも判断する
    expect(sheet).toContain('■ 何が満たされていたと感じるか');
  });

  it('種類を選んでいない記録は、シートに種類の行を出さない', () => {
    expect(buildSessionSheet(sample())).not.toContain('ふりかえった出来事');
  });
});
