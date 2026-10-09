// --- CARICATORE MODULARE COMPONENTI ---
async function loadComponent(containerId, filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Errore caricamento ${filePath}`);
    const html = await response.text();
    document.getElementById(containerId).innerHTML = html;
  } catch (error) {
    console.error(error);
  }
}

async function loadAllComponents() {
  await Promise.all([
    loadComponent('component-kpi', 'components/kpi-cards.html'),
    loadComponent('component-actions', 'components/box-actions.html'),
    loadComponent('component-report', 'components/report-section.html'),
    loadComponent('component-settings', 'components/settings.html')
  ]);
}