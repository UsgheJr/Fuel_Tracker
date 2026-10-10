// src/features/trips/components/TripCsvUploader.tsx
import React from 'react';
import Papa from 'papaparse';
import { parseTripCsvRow } from '../../../shared/utils/parseCsvTrips';

interface TripCsvUploaderProps {
  onImportParsed: (trips: any[]) => void;
}

export const TripCsvUploader: React.FC<TripCsvUploaderProps> = ({ onImportParsed }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedTrips = results.data.map((row: any) => parseTripCsvRow(row));
        onImportParsed(parsedTrips);
      },
    });
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-white shadow-sm">
      <p className="mb-2 text-sm text-gray-600">Trascina qui il file CSV dei viaggi o selezionalo</p>
      <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
    </div>
  );
};