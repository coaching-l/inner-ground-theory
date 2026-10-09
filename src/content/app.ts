// アプリ全体の文言
// アプリ名・各ステップの説明・STEP3の問いなどをここで管理します。

export const APP_NAME = '内的土壌ノート';
export const APP_TAGLINE = '刺激と反応のあいだに、スペースをつくる';
export const BRAND = 'COACHING-L';
export const KEY_MESSAGE = '経験が人を成長させるのではない。経験をどう統合し、意味づけるかが人を成長させる。';

export const STEPS = [
  { no: 1, short: '刺激と反応', title: '現在地を捉える', process: '自己認識' },
  { no: 2, short: '自己知識', title: '関係する領域を選ぶ', process: '自己知識' },
  { no: 3, short: '理解と受容', title: '関係を理解し、現在の自分を受け入れる', process: '自己理解・自己受容' },
] as const;

export const STEP1_COPY = {
  intro: '最近起きた出来事と、そのときの反応を分けて書いてみましょう。大きな問題でなくて構いません。日常の小さな違和感から始められます。',
  eventLabel: '何が起きましたか（事実）',
  eventHint: '見たこと・聞いたことを、できるだけそのまま。',
  eventPlaceholder: '例：会議で、自分の企画に対して部長から「詰めが甘い」と言われた',
  interpretationLabel: 'それを、どう受け取りましたか（解釈）',
  interpretationHint: '事実と受け取り方を分けると、次のステップの手がかりになります。',
  interpretationPlaceholder: '例：自分の能力を否定された、と感じた',
  emotionLabel: 'そのとき、何を感じましたか',
  emotionHint: '当てはまるものをいくつでも。ぴったりの言葉がなければ書き足せます。',
  intensityLabel: 'その感情の強さ',
  bodyLabel: '身体には、どのような反応がありましたか',
  thoughtsLabel: '頭の中では、どのような言葉が繰り返されていましたか',
  thoughtsPlaceholder: '例：やっぱり自分は詰めが甘い。もっと完璧にしなければ。',
  actionLabel: 'そのとき、実際にとった行動・とりたかった行動',
  actionPlaceholder: '例：何も言い返せず、黙ってうなずいた',
  wishLabel: '本当は、どうしたかったですか',
  wishPlaceholder: '例：企画の意図をきちんと説明したかった',
};

export const STEP2_COPY = {
  intro: '10領域の中から、今回の出来事に関係していそうな1〜2領域を選びます。これは診断ではなく、理解を深めるための仮説です。',
  signsLabel: '当てはまるサインはありますか',
  signsHint: 'いくつでも。なければ飛ばして構いません。',
  candidatesLabel: '関係していそうな領域（仮説）',
  candidatesEmpty: 'まだ手がかりが少ないようです。気になる領域を、下の一覧から選んでみてください。',
  allDomainsLabel: '10領域すべてから選ぶ',
  exploreLabel: '選んだ領域を探索する',
  exploreHint: '答えたい問いをタップしてください。すべてに答える必要はありません。',
  insightLabel: 'この領域で気づいたことを、一言で',
  insightPlaceholder: '例：「管理職は完璧でなければ」という前提があった',
};

export const STEP3_COPY = {
  intro: '選んだ領域を経験と結びつけます。原因を探すだけで終わらせず、現在の自分の状態を事実として捉えます。',
  understandTitle: '理解する',
  protectLabel: 'その反応は、何を守ろうとしていましたか',
  protectPlaceholder: '例：チームからの信頼、自分の評価',
  understandQuestions: [
    'なぜこの出来事に強く反応したのでしょうか',
    'どの前提が選択肢を狭めていますか',
    'どのような事情や背景がありましたか',
  ],
  sentenceLabel: 'つながりの一文',
  sentenceHint: 'これまでの回答から下書きしました。自分の言葉に書き直してください。',
  regenerate: '下書きを作り直す',
  acceptTitle: '受け入れる',
  acceptIntro: '受容は、無理に肯定することでも、変化をあきらめることでもありません。現実を否定せず、そこから次の選択を始めることです。',
  acceptQuestions: [
    '今の自分には、どのような事情がありましたか',
    'すぐに変えられない部分を、どう扱えますか',
  ],
  acceptChoiceLabel: '今の自分に近いのは',
  acceptChoiceYes: '受け止めてみる',
  acceptChoiceNotYet: 'まだ受け入れられない',
  acceptPrefix: '今の私には、',
  acceptSuffix: 'という側面がある。',
  acceptPlaceholder: '例：期待に応えようとして、自分を追い込みやすい',
  notYetSentence: 'まだ受け入れられない。そう感じている自分がいる。',
  notYetMessage: 'それも大切な現在地です。受け入れられない自分がいることを、そのまま受け止めてみましょう。',
  notYetNoteLabel: 'よければ、いまの気持ちを書き留めておきましょう',
};

export const SUMMARY_COPY = {
  nextSignLabel: '次に同じような場面がきたとき、気づきたいサイン',
  nextSignHint: '行動の計画ではなく「気づきの合図」を決めておきます。次の自己認識につながります。',
  nextSignPlaceholder: '例：肩に力が入ってきたとき／「やっぱり自分は」と思い始めたとき',
  coachNoteLabel: 'セッションでコーチと話したいこと',
  coachNotePlaceholder: '例：任せ方について、何から変えられるか一緒に考えたい',
  feelingLabel: '終えてみて、いまの気持ちは',
  feelings: [
    { id: 'clearer', label: '少し整理できた' },
    { id: 'same', label: '変わらない' },
    { id: 'heavy', label: 'しんどくなった' },
  ],
  heavyMessage:
    'ここまで向き合ってくれてありがとうございます。しんどさを感じたときは、ひとりで抱えなくて大丈夫です。今日はここで休んで、続きはコーチとのセッションで扱いましょう。',
  bridge: '意思決定と小さな一歩（STEP4〜6）は、コーチとのセッションで一緒に扱います。',
};

export const DISCLAIMER = [
  'このアプリは、教育およびコーチングのためのものです。医学的・心理学的な診断や治療を目的とするものではありません。',
  'すべての項目を埋める必要はありません。書きにくいところは空欄のままで構いません。',
  'いつでも中断できます。途中までの内容は自動で保存されます。',
  '書いた内容は、この端末のブラウザの中だけに保存されます。外部に送信されることはありません。',
];
