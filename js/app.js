let boxes = StorageManager.getBoxes();
let trips = StorageManager.getTrips();
let habitualConfig = StorageManager.getHabitualConfig();

let categoryChart = null;
let boxChart = null;

if (boxes.length === 0) {
  boxes.push({
    id: 'box_' + Date.now(),
    date: new Date().toISOString().split('T')[0],
    pricePerLiter: 1.799,
    active: true
  });
  StorageManager.saveData(boxes, trips);
}

function computeTripCost(distanceKm, consumptionPer100Km, pricePerLiter) {
  const liters = (distanceKm * consumptionPer100Km) / 100;
  const cost = liters * pricePerLiter;
  return { liters, cost };
}

function getActiveBox() {
  return boxes.find(b => b.active) || boxes[0];
}

function handleCreateBox(e) {
  e.preventDefault();
  const price = parseFloat(document.getElementById('box-price-input').value);
  const date = document.getElementById('box-date-input').value;

  boxes.forEach(b => b.active = false);

  const newBox = {
    id: 'box_' + Date.now(),
    date: date,
    pricePerLiter: price,
    active: true
  };
  boxes.unshift(newBox);
  StorageManager.saveData(boxes, trips);
  document.getElementById('form-new-box').reset();
  renderApp();
}

// Parser CSV robusto (gestisce virgolette, virgole nei decimali e colonne multiple)
function parseCSVLine(textLine) {
  const result = [];
  let inQuotes = false;
  let entry = '';
  for (let i = 0; i < textLine.length; i++) {
    const char = textLine[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(entry.trim());
      entry = '';
    } else {
      entry += char;
    }
  }
  result.push(entry.trim());
  return result.map(val => val.replace(/^"|"$/g, ''));
}

// Gestione importazione file CSV caricato
function handleCSVFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const text = event.target.result;
    const lines = text.split('\n');
    const activeBox = getActiveBox();
    let importedCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = parseCSVLine(line);
      // Verifica se la riga è l'intestazione o una riga dati valida (almeno 7 colonne)
      if (cols.length >= 7 && !cols[0].toLowerCase().includes('partenza')) {
        const origin = cols[0];
        const originTime = cols[1];
        const destination = cols[2];
        const destinationTime = cols[3];
        // Sostituisce la virgola decimale con il punto per il parsing numerico corretto
        const distanceKm = parseFloat(cols[4].replace(',', '.')) || 0;
        const consumption = parseFloat(cols[5].replace(',', '.')) || 0;
        const category = cols[6] || 'Generale';

        const trip = {
          id: 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          boxId: activeBox.id,
          origin,
          originTime,
          destination,
          destinationTime,
          distanceKm,
          consumption,
          category
        };
        trips.unshift(trip);
        importedCount++;
      }
    }

    if (importedCount > 0) {
      StorageManager.saveData(boxes, trips);
      document.getElementById('csv-file-input').value = '';
      renderApp();
      alert(`Importati con successo ${importedCount} viaggi dal file CSV nel box attivo!`);
    } else {
      alert("Nessun viaggio valido trovato nel file CSV.");
    }
  };
  reader.readAsText(file);
}

// Fallback per importazione testuale pipe-delimited
function handleImportText() {
  const textElement = document.getElementById('import-text');
  if (!textElement) return;
  
  const text = textElement.value.trim();
  if (!text) {
    alert("Inserisci del testo valido da importare.");
    return;
  }

  const lines = text.split('\n');
  const activeBox = getActiveBox();
  let importedCount = 0;

  lines.forEach(line => {
    if (!line.trim()) return;
    const parts = line.split('|').map(s => s.trim());
    if (parts.length >= 7) {
      const trip = {
        id: 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        boxId: activeBox.id,
        origin: parts[0],
        originTime: parts[1],
        destination: parts[2],
        destinationTime: parts[3],
        distanceKm: parseFloat(parts[4].replace(',', '.')) || 0,
        consumption: parseFloat(parts[5].replace(',', '.')) || 0,
        category: parts[6] || 'Generale'
      };
      trips.unshift(trip);
      importedCount++;
    }
  });

  if (importedCount > 0) {
    StorageManager.saveData(boxes, trips);
    textElement.value = '';
    renderApp();
    alert(`Importati con successo ${importedCount} viaggi nel box attivo!`);
  } else {
    alert("Formato non valido.");
  }
}

function handleManualTrip(e) {
  e.preventDefault();
  const activeBox = getActiveBox();

  const trip = {
    id: 'trip_' + Date.now(),
    boxId: activeBox.id,
    origin: document.getElementById('m-start').value,
    originTime: document.getElementById('m-start-time').value,
    destination: document.getElementById('m-dest').value,
    destinationTime: document.getElementById('m-dest-time').value,
    distanceKm: parseFloat(document.getElementById('m-km').value),
    consumption: parseFloat(document.getElementById('m-cons').value),
    category: document.getElementById('m-cat').value.trim() || 'Generale'
  };

  trips.unshift(trip);
  StorageManager.saveData(boxes, trips);
  document.getElementById('form-manual-trip').reset();
  renderApp();
}

function deleteTrip(id) {
  if (confirm('Eliminare questo viaggio?')) {
    trips = trips.filter(t => t.id !== id);
    StorageManager.saveData(boxes, trips);
    renderApp();
  }
}

function checkReminders() {
  if (boxes.length > 0) {
    const lastBox = boxes[0];
    const lastDate = new Date(lastBox.date);
    const today = new Date();
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays >= 7) {
      const banner = document.getElementById('reminder-banner');
      const text = document.getElementById('reminder-text');
      if (banner && text) {
        text.innerHTML = `<strong>Avviso Rifornimento:</strong> Sono passati <strong>${diffDays} giorni</strong> dal tuo ultimo pieno (${lastBox.date}). Hai effettuato un nuovo rifornimento?`;
        banner.classList.remove('hidden');
      }

      if (Notification.permission === 'granted') {
        new Notification('FuelTracker: Promemoria Pieno', {
          body: `Sono trascorsi ${diffDays} giorni dall'ultimo rifornimento registrato.`,
          icon: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png'
        });
      }
    }
  }

  const now = new Date();
  const currentHoursMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (habitualConfig && habitualConfig.time === currentHoursMin && Notification.permission === 'granted') {
    new Notification(`Promemoria Viaggio: ${habitualConfig.name}`, {
      body: `Hai effettuato il tragitto abituale "${habitualConfig.name}" oggi?`,
      icon: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png'
    });
  }
}

function exportPDF() {
  const element = document.getElementById('pdf-report-container');
  const opt = {
    margin:       [10, 10, 10, 10],
    filename:     `FuelTracker_Report_${new Date().toISOString().split('T')[0]}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

function renderApp() {
  document.getElementById('report-date').textContent = new Date().toLocaleDateString('it-IT');
  
  const activeBox = getActiveBox();
  document.getElementById('lbl-box-title').textContent = `${activeBox.date} (ID: ${activeBox.id.substr(-6)})`;
  document.getElementById('lbl-box-price').textContent = `€ ${activeBox.pricePerLiter.toFixed(3)} / L`;

  const catFilterEl = document.getElementById('filter-category');
  const boxFilterEl = document.getElementById('filter-box');
  const curCatVal = catFilterEl.value;
  const curBoxVal = boxFilterEl.value;

  const categories = [...new Set(trips.map(t => t.category))];
  catFilterEl.innerHTML = '<option value="ALL">Tutte le Categorie</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
  boxFilterEl.innerHTML = '<option value="ALL">Tutti i Box</option>' + boxes.map(b => `<option value="${b.id}">Box ${b.date} (€${b.pricePerLiter})</option>`).join('');
  
  catFilterEl.value = curCatVal;
  boxFilterEl.value = curBoxVal;

  const filteredTrips = trips.filter(t => {
    const matchesCat = (curCatVal === 'ALL' || t.category === curCatVal);
    const matchesBox = (curBoxVal === 'ALL' || t.boxId === curBoxVal);
    return matchesCat && matchesBox;
  });

  let totalKm = 0;
  let totalLiters = 0;
  let totalCost = 0;

  const categoryStats = {};
  const boxStats = {};

  const boxMap = {};
  boxes.forEach(b => {
    boxMap[b.id] = b;
    boxStats[b.id] = { label: `${b.date} (€${b.pricePerLiter})`, cost: 0 };
  });

  const tbody = document.getElementById('table-trips-body');
  tbody.innerHTML = '';

  filteredTrips.forEach(t => {
    const b = boxMap[t.boxId] || activeBox;
    const { liters, cost } = computeTripCost(t.distanceKm, t.consumption, b.pricePerLiter);

    totalKm += t.distanceKm;
    totalLiters += liters;
    totalCost += cost;

    if (!categoryStats[t.category]) {
      categoryStats[t.category] = { count: 0, km: 0, liters: 0, cost: 0 };
    }
    categoryStats[t.category].count++;
    categoryStats[t.category].km += t.distanceKm;
    categoryStats[t.category].liters += liters;
    categoryStats[t.category].cost += cost;

    if (boxStats[t.boxId]) {
      boxStats[t.boxId].cost += cost;
    }

    const row = document.createElement('tr');
    row.className = 'hover:bg-slate-50 transition border-b border-slate-100';
    row.innerHTML = `
      <td class="py-2 px-3 text-slate-600">${t.originTime ? t.originTime.replace('T', ' ').substring(0, 16) : '-'}</td>
      <td class="py-2 px-3 font-medium text-slate-800">${t.origin} &rarr; ${t.destination}</td>
      <td class="py-2 px-3">${t.distanceKm.toFixed(1)} km</td>
      <td class="py-2 px-3">${t.consumption.toFixed(1)} l/100km</td>
      <td class="py-2 px-3 text-slate-500">€ ${b.pricePerLiter.toFixed(3)}</td>
      <td class="py-2 px-3"><span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-semibold">${t.category}</span></td>
      <td class="py-2 px-3 text-right font-bold text-slate-900">€ ${cost.toFixed(2)}</td>
      <td class="py-2 px-3 text-center no-print">
        <button onclick="deleteTrip('${t.id}')" class="text-rose-500 hover:text-rose-700 p-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('kpi-total-cost').textContent = `€ ${totalCost.toFixed(2)}`;
  document.getElementById('kpi-total-km').textContent = `${totalKm.toFixed(1)} km`;
  document.getElementById('kpi-cost-per-km').textContent = totalKm > 0 ? `€ ${(totalCost / totalKm).toFixed(3)}` : '€ 0.000';
  document.getElementById('kpi-avg-consumption').textContent = totalKm > 0 ? `${((totalLiters / totalKm) * 100).toFixed(2)} l/100km` : '0.0 l/100km';

  const catTableBody = document.getElementById('table-category-summary');
  catTableBody.innerHTML = '';
  Object.keys(categoryStats).forEach(cat => {
    const item = categoryStats[cat];
    const share = totalCost > 0 ? ((item.cost / totalCost) * 100).toFixed(1) : 0;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="py-2 px-3 font-bold text-slate-700">${cat}</td>
      <td class="py-2 px-3">${item.count}</td>
      <td class="py-2 px-3">${item.km.toFixed(1)} km</td>
      <td class="py-2 px-3">${item.liters.toFixed(1)} L</td>
      <td class="py-2 px-3 font-bold text-slate-900">€ ${item.cost.toFixed(2)}</td>
      <td class="py-2 px-3"><span class="text-indigo-600 font-semibold">${share}%</span></td>
    `;
    catTableBody.appendChild(row);
  });

  updateCharts(categoryStats, boxStats);
  lucide.createIcons();
}

function updateCharts(categoryStats, boxStats) {
  const catLabels = Object.keys(categoryStats);
  const catData = catLabels.map(k => categoryStats[k].cost.toFixed(2));

  if (categoryChart) categoryChart.destroy();
  const ctxCat = document.getElementById('chart-categories').getContext('2d');
  categoryChart = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: catLabels.length ? catLabels : ['Nessun dato'],
      datasets: [{
        data: catData.length ? catData : [1],
        backgroundColor: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } }
    }
  });

  const boxLabels = Object.values(boxStats).map(b => b.label);
  const boxData = Object.values(boxStats).map(b => b.cost.toFixed(2));

  if (boxChart) boxChart.destroy();
  const ctxBox = document.getElementById('chart-boxes').getContext('2d');
  boxChart = new Chart(ctxBox, {
    type: 'bar',
    data: {
      labels: boxLabels,
      datasets: [{ label: 'Spesa (€)', data: boxData, backgroundColor: '#4f46e5' }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false } }
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('box-date-input').value = new Date().toISOString().split('T')[0];
  
  if (habitualConfig) {
    document.getElementById('habitual-trip-name').value = habitualConfig.name || '';
    document.getElementById('habitual-trip-time').value = habitualConfig.time || '';
  }

  document.getElementById('form-new-box').addEventListener('submit', handleCreateBox);
  document.getElementById('csv-file-input').addEventListener('change', handleCSVFileUpload);
  document.getElementById('btn-import-text').addEventListener('click', handleImportText);
  document.getElementById('form-manual-trip').addEventListener('submit', handleManualTrip);
  document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);
  document.getElementById('filter-category').addEventListener('change', renderApp);
  document.getElementById('filter-box').addEventListener('change', renderApp);
  document.getElementById('btn-dismiss-banner').addEventListener('click', () => {
    document.getElementById('reminder-banner').classList.add('hidden');
  });
  
  document.getElementById('btn-request-notif').addEventListener('click', () => {
    if (!("Notification" in window)) {
      alert("Questo browser non supporta le notifiche.");
      return;
    }
    Notification.requestPermission().then(permission => {
      if (permission === "granted") alert("Notifiche abilitate con successo!");
    });
  });

  document.getElementById('btn-save-habitual').addEventListener('click', () => {
    const name = document.getElementById('habitual-trip-name').value;
    const time = document.getElementById('habitual-trip-time').value;
    if (name && time) {
      habitualConfig = { name, time };
      StorageManager.saveHabitual(habitualConfig);
      alert('Promemoria viaggio abituale impostato per le ore ' + time);
    }
  });

  document.getElementById('btn-save-supabase').addEventListener('click', () => {
    const url = document.getElementById('supabase-url').value;
    const key = document.getElementById('supabase-key').value;
    if (url && key) {
      StorageManager.saveSupabase(url, key);
      alert('Credenziali salvate!');
    }
  });

  renderApp();
  checkReminders();
  setInterval(checkReminders, 60000);
});