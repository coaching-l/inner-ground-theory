// 相談窓口
// 公開前に、必ず各団体・厚生労働省の最新情報を確認してください。
// 参考：厚生労働省「電話相談窓口」 https://www.mhlw.go.jp/mamorouyokokoro/soudan/tel
// （2026年10月時点で確認）

export interface SupportContact {
  name: string;
  tel: string;
  hours: string;
  note?: string;
}

export const SUPPORT_CONTACTS: SupportContact[] = [
  {
    name: 'よりそいホットライン',
    tel: '0120-279-338',
    hours: '24時間・無料',
    note: '岩手・宮城・福島からは 0120-279-226',
  },
  {
    name: 'いのちの電話（フリーダイヤル）',
    tel: '0120-783-556',
    hours: '毎日16時〜21時／毎月10日は8時〜翌8時・無料',
  },
  {
    name: 'いのちの電話（ナビダイヤル）',
    tel: '0570-783-556',
    hours: '毎日10時〜22時・通話料有料',
  },
  {
    name: 'こころの健康相談統一ダイヤル',
    tel: '0570-064-556',
    hours: 'お住まいの自治体の窓口につながります（受付時間は地域で異なります）',
  },
];

export const SUPPORT_INFO_URL = 'https://www.mhlw.go.jp/mamorouyokokoro/soudan/tel';
