export interface RawCsvTrip {
  [key: string]: any;
}

// Funzione per pulire l'indirizzo (mantiene solo via e località principale)
export function cleanAddress(fullAddress: string): string {
  if (!fullAddress) return "Indirizzo non specificato";
  
  try {
    let cleaned = fullAddress.replace(/provincia di.*$/i, "").trim();
    cleaned = cleaned.replace(/,\s*$/, "");
    return cleaned;
  } catch (e) {
    return fullAddress;
  }
}

// Funzione di utilità per cercare una stringa che sia un timestamp valido all'interno della riga
function findValidDate(rowObj: Record<string, any>, preferredKeys: string[]): string {
  // 1. Controlla prima le chiavi preferite (es. "Unnamed: 1", etc.)
  for (const key of preferredKeys) {
    if (rowObj[key]) {
      const d = new Date(rowObj[key]);
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
    }
  }

  // 2. Se non la trova, scansiona TUTTI i valori della riga alla ricerca di una data valida
  for (const val of Object.values(rowObj)) {
    if (typeof val === 'string' && (val.includes('T') || val.includes('-')) && val.length > 10) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
    }
  }

  return new Date().toISOString();
}

export function parseTripCsvRow(row: RawCsvTrip) {
  // Estrazione flessibile delle chiavi (gestisce variazioni di intestazione nel CSV)
  const keys = Object.keys(row);
  
  // Trova i campi di partenza e destinazione (di solito la 1° e la 3° colonna)
  const rawDepAddress = row["Partenza"] || row[keys[0]] || "";
  const rawArrAddress = row["Destinazione"] || row[keys[2]] || "";

  // Cerca le date in modo intelligente nelle colonne "Unnamed: 1", "Unnamed: 3" o simili
  const departureIso = findValidDate(row, ["Unnamed: 1", keys[1], "departure_time"]);
  const arrivalIso = findValidDate(row, ["Unnamed: 3", keys[3], "arrival_time"]);

  // Campi numerici con conversione sicura da virgola a punto
  const rawDistance = row["Distanza percorsa (km)"] ?? row[keys[4]] ?? "0";
  const rawConsumption = row["Consumo di carburante (l/100km)"] ?? row[keys[5]] ?? "0";

  const distance = parseFloat(String(rawDistance).replace(",", "."));
  const consumption = parseFloat(String(rawConsumption).replace(",", "."));

  const category = row["Categoria viaggio"] ?? row[keys[6]] ?? "Personale";

  return {
    departure_address: cleanAddress(String(rawDepAddress)),
    departure_time: departureIso,
    arrival_address: cleanAddress(String(rawArrAddress)),
    arrival_time: arrivalIso,
    distance_km: isNaN(distance) ? 0 : distance,
    average_consumption_l_100km: isNaN(consumption) ? 0 : consumption,
    category: String(category),
  };
}