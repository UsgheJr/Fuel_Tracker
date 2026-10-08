// --- GESTIONE STATO E STORAGE ---
const StorageManager = {
  getBoxes() {
    return JSON.parse(localStorage.getItem('ft_boxes')) || [];
  },
  
  getTrips() {
    return JSON.parse(localStorage.getItem('ft_trips')) || [];
  },

  getHabitualConfig() {
    return JSON.parse(localStorage.getItem('ft_habitual')) || { name: 'Casa - Ufficio', time: '08:30' };
  },

  saveData(boxes, trips) {
    localStorage.setItem('ft_boxes', JSON.stringify(boxes));
    localStorage.setItem('ft_trips', JSON.stringify(trips));
  },

  saveHabitual(config) {
    localStorage.setItem('ft_habitual', JSON.stringify(config));
  },

  saveSupabase(url, key) {
    localStorage.setItem('ft_sb_url', url);
    localStorage.setItem('ft_sb_key', key);
  }
};