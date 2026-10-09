import type { Entry, StepNo } from '../lib/types';

export interface EntryScreenProps {
  entry: Entry;
  update: (updater: (entry: Entry) => Entry) => void;
  goStep: (step: StepNo) => void;
  onExit: () => void;
}
