export const MAX_CSV_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface FileValidationResult {
  isValid: boolean;
  errorMessage: string | null;
}

/**
 * Valida la dimensione e l'estensione/MIME type di un file scaricato o caricato dall'utente.
 */
export function validateCsvFile(file: File): FileValidationResult {
  if (!file) {
    return { isValid: false, errorMessage: 'Nessun file selezionato.' };
  }

  // 1. Controllo limite dimensione (Max 5MB)
  if (file.size > MAX_CSV_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      errorMessage: `File troppo grande (${sizeInMB} MB). Il limite massimo consentito è 5 MB.`,
    };
  }

  // 2. Controllo formato/estensione
  const hasCsvExtension = file.name.toLowerCase().endsWith('.csv');
  if (!hasCsvExtension) {
    return {
      isValid: false,
      errorMessage: 'Formato non supportato. Seleziona un file con estensione .csv',
    };
  }

  return { isValid: true, errorMessage: null };
}