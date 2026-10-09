import { BottomBar, Page, TopBar } from '../components/layout';
import { showToast } from '../components/Toast';
import { navigate } from '../lib/router';
import type { Entry, Step1Data } from '../lib/types';
import { Step1Fields } from './Step1';

export function Quick(props: { entry: Entry; update: (updater: (entry: Entry) => Entry) => void }) {
  const { entry, update } = props;
  const set = (patch: Partial<Step1Data>) => update((e) => ({ ...e, step1: { ...e.step1, ...patch } }));
  return (
    <>
      <TopBar onBack={() => navigate({ name: 'home' })} backLabel="閉じる" />
      <Page>
        <div className="step-heading">
          <p className="eyebrow">さっと記録</p>
          <h1 className="step-title">出来事と反応だけ、残しておく</h1>
          <p className="lead">
            その場では記録だけ。時間ができたら「これまでの記録」から続き（STEP2・STEP3）に進めます。
          </p>
        </div>
        <Step1Fields data={entry.step1} set={set} quick />
      </Page>
      <BottomBar
        onBack={() => {
          update((e) => ({ ...e, status: 'exploring' }));
          navigate({ name: 'entry', id: entry.id, step: 1 });
        }}
        backLabel="いま深める"
        onNext={() => {
          showToast('記録しました');
          navigate({ name: 'home' });
        }}
        nextLabel="記録して閉じる"
      />
    </>
  );
}
