import React from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { pwaStyles as styles } from '../styles/pwaStyles';

export const InstallAppButton: React.FC = () => {
  const { canInstall, showIosGuide, setShowIosGuide, promptInstall } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        onClick={() => void promptInstall()}
        className={styles.installButton}
        title="Installa Trip Cost Tracker sul dispositivo"
      >
        <span>Scarica App</span>
      </button>

      {showIosGuide && (
        <div className={styles.iosPopover}>
          <div className={styles.iosPopoverHeader}>
            <span>Installa su iPhone / iPad</span>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className={styles.closeBtn}
            >
              ✕
            </button>
          </div>
          <p className="leading-relaxed text-slate-600">
            Tocca l&apos;icona <strong>Condividi</strong> nella barra di Safari e seleziona{' '}
            <strong>Aggiungi alla schermata Home</strong>.
          </p>
        </div>
      )}
    </div>
  );
};