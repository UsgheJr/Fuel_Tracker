// src/features/trips/components/TripCsvUploader.tsx

import React from 'react';
import Papa from 'papaparse';
import { parseTripCsvRowArray } from '../../../shared/utils/parseCsvTrips';
import type { Trip } from '../../../shared/types';

interface TripCsvUploaderProps {
  currentUserId: string;
  onImportParsed: (trips: Trip[]) => void;
}

export const TripCsvUploader: React.FC<TripCsvUploaderProps> = ({
  currentUserId,
  onImportParsed,
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
        }
      },
    });

    // Reset dell'input per permettere il re-upload dello stesso file
    event.target.value = '';
  };

  return (
    <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center bg-white shadow-2xs hover:border-indigo-400 transition-colors">
      <p className="mb-2 text-xs font-semibold text-slate-600">
        Trascina qui il file CSV dei viaggi o selezionalo dal dispositivo
      </p>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
      />
    </div>
  );
};