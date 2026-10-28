import React, { useState } from 'react';
import Papa from 'papaparse';
import { parseTripCsvRowArray } from '../../../shared/utils/parseCsvTrips';
import { validateCsvFile } from '../../../shared/utils/fileValidators';
import { tripCsvUploaderStyles as styles } from '../styles/tripCsvUploaderStyles';
import type { Trip } from '../../../shared/types';

interface TripCsvUploaderProps {
  currentUserId: string;
  onImportParsed: (trips: Trip[]) => void;
}

export const TripCsvUploader: React.FC<TripCsvUploaderProps> = ({
  currentUserId,
  onImportParsed,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) return;

    // Validazione di sicurezza prima di avviare il parsing
    const validation = validateCsvFile(file);
    if (!validation.isValid) {
      setError(validation.errorMessage);
      event.target.value = ''; // Reset dell'input
      return;
    }

    // Parsing con PapaParse a seguito della verifica di sicurezza
    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedTrips: Trip[] = [];
        for (const row of results.data) {
          const trip = parseTripCsvRowArray(row, currentUserId);
          if (trip) {
            parsedTrips.push(trip);
          }
        }

        if (parsedTrips.length > 0) {
          onImportParsed(parsedTrips);
        } else {
          setError('Il file CSV non contiene viaggi validi o ha un formato errato.');
        }
      },
      error: (err) => {
        console.error('[TripCsvUploader] Errore di parsing CSV:', err);
        setError('Errore durante la lettura del file CSV.');
      },
    });

    // Reset dell'input per permettere il re-upload dello stesso file in caso di correzioni
    event.target.value = '';
  };

  return (
    <div className={styles.container(Boolean(error))}>
      <span className={styles.label}>
        Trascina qui il file CSV dei viaggi o selezionalo dal dispositivo (Max 5MB)
      </span>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className={styles.input}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};