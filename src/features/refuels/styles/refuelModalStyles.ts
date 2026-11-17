export const refuelModalStyles = {
  // Card compatta nella griglia principale (allineata a "Importa Viaggi")
  cardWrapper:
    'bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full',
  cardHeader: 'flex items-center justify-between mb-1',
  cardTitle: 'text-base font-bold text-slate-800',
  cardBadge: 'text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full',
  cardSubtitle: 'text-xs text-slate-400 mb-4',
  actionsGrid: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
  btnNewRefuel:
    'w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer text-center',
  btnOpenHistory:
    'w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer text-center',

  // Overlay & Modali
  overlay:
    'fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50',
  modalBoxSmall:
    'bg-white shadow-xl rounded-t-2xl sm:rounded-2xl border border-slate-200 p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto',
  modalBoxLarge:
    'bg-white shadow-xl rounded-t-2xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col',  modalHeader: 'flex items-center justify-between pb-4 mb-4 border-b border-slate-100',
  modalTitle: 'text-base font-bold text-slate-800',
  closeBtn:
    'text-slate-400 hover:text-slate-700 text-sm font-bold px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer',

  // Barra Navigazione Mensile
  monthNavWrapper:
    'flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3',
  navArrowBtn:
    'px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer disabled:opacity-40',
  monthLabel: 'text-xs font-extrabold uppercase tracking-wider text-slate-800',

  // Ricerca & Lista Storico
  searchInput:
    'w-full px-3 py-2 mb-3 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500',
  summaryStrip:
    'flex justify-between items-center text-[11px] text-slate-500 bg-indigo-50/50 border border-indigo-100 px-3 py-2 rounded-lg mb-3',
  listScrollArea: 'space-y-2 overflow-y-auto pr-1 flex-1 min-h-[200px] max-h-[45vh]',
  listItem:
    'flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition',
  editLinkBtn:
    'text-indigo-600 hover:text-indigo-800 text-xs font-bold uppercase px-2.5 py-1 rounded-md hover:bg-indigo-50 cursor-pointer',
} as const;