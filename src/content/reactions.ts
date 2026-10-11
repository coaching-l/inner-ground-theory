// STEP1「反応」で選べる感情と身体の反応
// 感情は「〜を感じた」とつながるよう、名詞の形にしています。
// 「ざわつく・重い」と「あたたかい・明るい」の2つに分けて表示します（よい・悪いの区別ではありません）。

/** ざわつく・重い感情 */
export const TENSE_EMOTIONS: string[] = [
  '怒り',
  'イライラ',
  '不安',
  '焦り',
  '悔しさ',
  '悲しみ',
  '恐れ',
  '恥ずかしさ',
  '罪悪感',
  '寂しさ',
  '失望',
  'むなしさ',
  '戸惑い',
  '嫉妬',
];

/** あたたかい・明るい感情 */
export const WARM_EMOTIONS: string[] = ['安心', '喜び', 'ワクワク', '誇らしさ', '感謝', '充実感', '達成感'];

export const EMOTIONS: string[] = [...TENSE_EMOTIONS, ...WARM_EMOTIONS];

/** こわばる・重い身体の反応 */
export const TENSE_BODY_REACTIONS: string[] = [
  '胸が苦しい・ざわざわする',
  '肩や首がこわばる',
  '胃が重い・お腹が痛む',
  'のどが詰まる',
  '顔や頭が熱くなる',
  '呼吸が浅い・速い',
  '手やあごに力が入る',
  '心臓がどきどきする',
  'どっと疲れる・だるい',
  '力が抜ける',
];

/** ゆるむ・軽い身体の反応 */
export const WARM_BODY_REACTIONS: string[] = [
  '胸があたたかくなる',
  '体が軽くなる',
  '呼吸が深く、ゆったりする',
  '自然と顔がほころぶ',
  '力が湧いてくる',
];

export const BODY_REACTIONS: string[] = [...TENSE_BODY_REACTIONS, ...WARM_BODY_REACTIONS];

export const INTENSITY_LABELS: Record<number, string> = {
  1: 'かすか',
  2: '少し',
  3: 'ほどほど',
  4: '強い',
  5: 'とても強い',
};
