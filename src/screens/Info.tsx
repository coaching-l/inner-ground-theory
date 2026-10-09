import { APP_TAGLINE, BRAND, DISCLAIMER, KEY_MESSAGE } from '../content/app';
import { BrandHeader, Page } from '../components/layout';
import { SupportList } from '../components/SupportBox';
import { Notice, Section } from '../components/ui';

const SIX_STEPS: { no: number; title: string; process: string; where: 'app' | 'session' }[] = [
  { no: 1, title: '現在地を捉える', process: '自己認識', where: 'app' },
  { no: 2, title: '関係する領域を選ぶ', process: '自己知識', where: 'app' },
  { no: 3, title: '関係を理解し、現在の自分を受け入れる', process: '自己理解・自己受容', where: 'app' },
  { no: 4, title: '意思決定と小さな挑戦を設計する', process: '意思決定・行動・挑戦', where: 'session' },
  { no: 5, title: '経験を観察し、内省する', process: '経験・内省', where: 'session' },
  { no: 6, title: '再解釈し、自己統合する', process: '意味づけ・自己統合', where: 'session' },
];

function StepMap() {
  return (
    <ol className="stepmap">
      {SIX_STEPS.map((s) => (
        <li key={s.no} className={`stepmap-item stepmap-${s.where}`}>
          <span className="stepmap-no">STEP {s.no}</span>
          <span className="stepmap-title">{s.title}</span>
          <span className="stepmap-where">{s.where === 'app' ? 'アプリでひとりで' : 'コーチとのセッションで'}</span>
        </li>
      ))}
    </ol>
  );
}

export function Welcome(props: { onStart: () => void }) {
  return (
    <Page className="welcome">
      <div className="hero">
        <BrandHeader />
        <p className="hero-tagline">{APP_TAGLINE}</p>
      </div>
      <Notice tone="navy">
        <p>{KEY_MESSAGE}</p>
      </Notice>
      <Section title="このアプリでできること">
        <p>
          日常の出来事（刺激）と、そのときの自分の反応を手がかりに、内的土壌成長モデルのSTEP1〜3をひとりで進めるためのノートです。
        </p>
        <StepMap />
      </Section>
      <Section title="ご利用にあたって">
        <ul className="bullets">
          {DISCLAIMER.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </Section>
      <button type="button" className="btn btn-primary btn-block" onClick={props.onStart}>
        はじめる
      </button>
    </Page>
  );
}

export function About(props: { onClearAll: () => void }) {
  return (
    <Page>
      <div className="step-heading">
        <h1 className="step-title">このアプリについて</h1>
      </div>
      <Section title="内的土壌とは">
        <Notice tone="gold">
          <p>自己統合を繰り返すことによって育まれる、価値観に沿った意思決定と挑戦を支える内面的な土壌です。</p>
        </Notice>
        <p>
          内的土壌が豊かになることは、迷いや不安がなくなることではありません。正解が分からない状況でも、自分の価値観と現実を踏まえて選択し、その結果から学び直せる状態に近づくことです。
        </p>
      </Section>
      <Section title="6ステップと、このアプリの範囲">
        <StepMap />
        <p className="small">
          ステップは一方向・同じ順序で進むものではありません。必要に応じて行き来しながら、理解と統合を深めます。
        </p>
      </Section>
      <Section title="大切にしていること">
        <ul className="bullets">
          <li>タイプやスコアで自分を分類しません。10領域は診断ではなく、対話と内省を深めるための地図です。</li>
          <li>一度に扱う領域は1〜2つまで。すべてを埋める必要はありません。</li>
          <li>過去の原因探しや、無理に前向きに捉えることを目的にしません。</li>
          <li>受容は現状維持ではなく、現実を否定せず、そこから次の選択を始めることです。</li>
        </ul>
      </Section>
      <Section title="ご利用にあたって">
        <ul className="bullets">
          {DISCLAIMER.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </Section>
      <Section title="データについて">
        <p>
          記録はこの端末のブラウザの中にだけ保存されます。ブラウザの履歴やサイトデータを消すと、記録も消えます。別の端末とは共有されません。
        </p>
        <ul className="bullets">
          <li>
            LINE などのアプリの中で開いたときと、Safari や Chrome で開いたときとでは、保存場所が別々です。ホーム画面に追加したアイコンから開いたときも別になります。いつも同じ開き方で使ってください。
          </li>
          <li>
            iPhone・Mac の Safari は、しばらく開かなかったサイトの記録を自動で消すことがあります。残しておきたい内容は、まとめ画面の「セッション準備シートをコピー」や「印刷・PDFで保存」で手元に残してください。
          </li>
        </ul>
        <button
          type="button"
          className="btn btn-danger-text"
          onClick={() => {
            if (window.confirm('すべての記録を削除しますか？元に戻せません。')) props.onClearAll();
          }}
        >
          すべての記録を削除
        </button>
      </Section>
      <p className="small center">
        出典：{BRAND}「内的土壌理論・内的土壌成長モデル 統合実践ガイド」Ver1.1
        <br />© {BRAND}
      </p>
    </Page>
  );
}

export function Support() {
  return (
    <Page>
      <div className="step-heading">
        <h1 className="step-title">つらいときの相談先</h1>
        <p className="lead">
          自分と向き合う中で、しんどさを感じることもあります。ひとりで抱えなくて大丈夫です。担当のコーチに伝えるか、こちらの窓口に相談してください。
        </p>
      </div>
      <SupportList />
    </Page>
  );
}
