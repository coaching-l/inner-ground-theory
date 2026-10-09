import { useCallback, useEffect, useState } from 'react';
import { Page, TopBar } from './components/layout';
import { showToast, Toast } from './components/Toast';
import { Notice } from './components/ui';
import { createEntry, hasStep1Content } from './lib/entry';
import { navigate, useRoute } from './lib/router';
import { clearEntries, hasWelcomed, isStorageAvailable, loadEntries, markWelcomed, saveEntries } from './lib/storage';
import type { Entry, EntryStatus, StepNo } from './lib/types';
import { History, Home } from './screens/Home';
import { About, Support, Welcome } from './screens/Info';
import { Quick } from './screens/Quick';
import { Step1 } from './screens/Step1';
import { Step2 } from './screens/Step2';
import { Step3 } from './screens/Step3';
import { Summary } from './screens/Summary';

function isEmpty(entry: Entry): boolean {
  return !hasStep1Content(entry) && entry.step2.domains.length === 0 && entry.status !== 'done';
}

function byUpdatedDesc(a: Entry, b: Entry): number {
  return b.updatedAt.localeCompare(a.updatedAt);
}

export function App() {
  const route = useRoute();
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries());
  const [welcomed, setWelcomed] = useState(() => hasWelcomed());
  const [storageOk] = useState(() => isStorageAvailable());

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  // 何も書かずに閉じた記録は、一覧に残さない
  useEffect(() => {
    if (route.name === 'home' || route.name === 'history') {
      setEntries((list) => (list.some(isEmpty) ? list.filter((e) => !isEmpty(e)) : list));
    }
  }, [route.name]);

  const updateEntry = useCallback((id: string, updater: (entry: Entry) => Entry) => {
    setEntries((list) =>
      list.map((e) => (e.id === id ? { ...updater(e), updatedAt: new Date().toISOString() } : e)),
    );
  }, []);

  const start = (status: EntryStatus) => {
    const entry = createEntry(status);
    setEntries((list) => [entry, ...list]);
    navigate(status === 'quick' ? { name: 'quick', id: entry.id } : { name: 'entry', id: entry.id, step: 1 });
  };

  const removeEntry = (id: string) => setEntries((list) => list.filter((e) => e.id !== id));

  const entryId = route.name === 'entry' || route.name === 'quick' ? route.id : null;
  const entry = entryId ? entries.find((e) => e.id === entryId) : undefined;
  const step = route.name === 'entry' ? route.step : null;

  // 記録のみ（quick）の記録をSTEPで開いたら「探索中」に。最後に開いたSTEPも覚えておく
  useEffect(() => {
    if (!entry || step === null) return;
    const status: EntryStatus = entry.status === 'quick' ? 'exploring' : entry.status;
    if (entry.lastStep !== step || entry.status !== status) {
      updateEntry(entry.id, (e) => ({ ...e, status, lastStep: step }));
    }
  }, [entry, step, updateEntry]);

  const storageWarning = !storageOk && (
    <div className="page">
      <Notice tone="gold" title="この環境では記録を保存できません">
        <p>プライベートブラウズなどでは、閉じると内容が消えます。通常のブラウザで開くと保存できます。</p>
      </Notice>
    </div>
  );

  if (!welcomed) {
    return (
      <>
        {storageWarning}
        <Welcome
          onStart={() => {
            markWelcomed();
            setWelcomed(true);
            navigate({ name: 'home' });
          }}
        />
      </>
    );
  }

  const sorted = [...entries].sort(byUpdatedDesc);
  const home = () => navigate({ name: 'home' });

  let screen;
  if (entryId && !entry) {
    screen = (
      <>
        <TopBar onBack={home} backLabel="ホーム" />
        <Page>
          <p className="muted">この記録は見つかりませんでした。削除されたか、別の端末で作られた記録かもしれません。</p>
        </Page>
      </>
    );
  } else if (route.name === 'quick' && entry) {
    screen = <Quick entry={entry} update={(fn) => updateEntry(entry.id, fn)} />;
  } else if (route.name === 'entry' && entry) {
    const props = {
      entry,
      update: (fn: (e: Entry) => Entry) => updateEntry(entry.id, fn),
      goStep: (s: StepNo) => navigate({ name: 'entry', id: entry.id, step: s }),
      onExit: () => {
        if (entry.status !== 'done' && hasStep1Content(entry)) showToast('途中まで保存しました');
        home();
      },
    };
    screen =
      route.step === 1 ? (
        <Step1 {...props} />
      ) : route.step === 2 ? (
        <Step2 {...props} />
      ) : route.step === 3 ? (
        <Step3 {...props} />
      ) : (
        <Summary
          {...props}
          onDelete={() => {
            removeEntry(entry.id);
            showToast('削除しました');
            home();
          }}
        />
      );
  } else if (route.name === 'history') {
    screen = (
      <>
        <TopBar onBack={home} backLabel="ホーム" />
        <History entries={sorted.filter((e) => !isEmpty(e))} onDelete={removeEntry} />
      </>
    );
  } else if (route.name === 'about') {
    screen = (
      <>
        <TopBar onBack={home} backLabel="ホーム" />
        <About
          onClearAll={() => {
            clearEntries();
            setEntries([]);
            showToast('すべての記録を削除しました');
          }}
        />
      </>
    );
  } else if (route.name === 'support') {
    screen = (
      <>
        <TopBar onBack={home} backLabel="ホーム" />
        <Support />
      </>
    );
  } else {
    screen = (
      <Home entries={sorted.filter((e) => !isEmpty(e))} onStart={() => start('exploring')} onQuick={() => start('quick')} />
    );
  }

  return (
    <>
      {storageWarning}
      {screen}
      <Toast />
    </>
  );
}
