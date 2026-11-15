import React, { useState } from 'react';
import { RefuelFormModal } from './RefuelFormModal';
import { RefuelHistoryModal } from './RefuelHistoryModal';
import { refuelModalStyles as styles } from '../styles/refuelModalStyles';
import type { RefuelBox } from '../../../shared/types';

interface RefuelBoxListProps {
  refuelBoxes: RefuelBox[];
  currentUserId: string;
  onAddRefuelBox: (box: RefuelBox) => void;
  onUpdateRefuelBox: (updatedBox: RefuelBox) => void;
}

export const RefuelBoxList: React.FC<RefuelBoxListProps> = ({
  refuelBoxes,
  currentUserId,
  onAddRefuelBox,
  onUpdateRefuelBox,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<RefuelBox | null>(null);

  const handleOpenNewForm = () => {
    setEditingBox(null);
    setIsFormOpen(true);
  };

  const handleOpenEditFromHistory = (box: RefuelBox) => {
    setIsHistoryOpen(false);
    setEditingBox(box);
    setIsFormOpen(true);
  };

  return (
    <>
      <div className={styles.cardWrapper}>
        <div>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Gestione Rifornimenti</h2>
            <span className={styles.cardBadge}>{refuelBoxes.length} salvati</span>
          </div>
          <p className={styles.cardSubtitle}>
            Registra un nuovo pieno o consulta lo storico diviso per mese.
          </p>
        </div>

        <div className={styles.actionsGrid}>
          <button
            type="button"
            onClick={handleOpenNewForm}
            className={styles.btnNewRefuel}
          >
            + Nuovo Rifornimento
          </button>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className={styles.btnOpenHistory}
          >
            Storico Rifornimenti
          </button>
        </div>
      </div>

      <RefuelFormModal
        isOpen={isFormOpen}
        boxToEdit={editingBox}
        refuelBoxes={refuelBoxes}
        currentUserId={currentUserId}
        onAddRefuelBox={onAddRefuelBox}
        onUpdateRefuelBox={onUpdateRefuelBox}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBox(null);
        }}
      />

      <RefuelHistoryModal
        isOpen={isHistoryOpen}
        refuelBoxes={refuelBoxes}
        onEditBox={handleOpenEditFromHistory}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  );
};