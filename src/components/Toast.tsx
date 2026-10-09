import { useEffect, useState } from 'react';

const EVENT = 'ign:toast';

export function showToast(message: string): void {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: message }));
}

export function Toast() {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    let timer: number | undefined;
    const onToast = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMessage(null), 2400);
    };
    window.addEventListener(EVENT, onToast);
    return () => {
      window.removeEventListener(EVENT, onToast);
      window.clearTimeout(timer);
    };
  }, []);
  return (
    <div className="toast-region no-print" role="status" aria-live="polite">
      {message && <div className="toast">{message}</div>}
    </div>
  );
}
