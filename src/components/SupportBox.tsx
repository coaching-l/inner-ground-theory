import { SUPPORT_CONTACTS, SUPPORT_INFO_URL } from '../content/support';

export function SupportList() {
  return (
    <>
      <ul className="support-list">
        {SUPPORT_CONTACTS.map((c) => (
          <li key={c.tel}>
            <p className="support-name">{c.name}</p>
            <a className="support-tel" href={`tel:${c.tel.replace(/-/g, '')}`}>
              {c.tel}
            </a>
            <p className="support-hours">{c.hours}</p>
            {c.note && <p className="support-hours">{c.note}</p>}
          </li>
        ))}
      </ul>
      <p className="small">
        ほかの相談先は
        <a href={SUPPORT_INFO_URL} target="_blank" rel="noreferrer">
          厚生労働省「まもろうよ こころ」
        </a>
        で探せます。命の危険があるときは、迷わず119番・110番へ。
      </p>
    </>
  );
}
