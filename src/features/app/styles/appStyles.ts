export const appStyles = {
  pageWrapper: 'min-h-screen bg-slate-100 text-slate-900 pb-12 relative',
  header: 'bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 shadow-xs mb-5 sm:mb-8',
  headerContainer:
    'max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3',
  headerActions: 'flex flex-wrap items-center gap-2 sm:gap-3',
  title: 'text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight',
  subtitle: 'text-[11px] sm:text-xs text-slate-500',
  buttonPrimary:
    'flex-1 sm:flex-none justify-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer text-center',
  buttonSuccess:
    'px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer',
  buttonSecondary:
    'px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer',
  mainContainer: 'max-w-6xl mx-auto px-3.5 sm:px-6 space-y-5 sm:space-y-6',
  loadingSync: 'p-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-medium text-center',
  modalOverlay:
    'fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50',
} as const;