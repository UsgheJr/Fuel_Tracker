export const tripManualFormStyles = {
  wrapper:
    'bg-white shadow-xl rounded-t-2xl sm:rounded-xl border border-slate-200 p-5 sm:p-6 max-w-lg mx-auto w-full max-h-[90vh] overflow-y-auto',
  title: 'text-base sm:text-lg font-bold text-slate-800 mb-4',
  fieldGroup: 'mb-3.5 sm:mb-4',
  label: 'block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1',
  input:
    'w-full px-3 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800',
  select:
    'w-full px-3 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-slate-800',
  rowGrid: 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3.5 sm:mb-4',
  submitButton:
    'w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 sm:py-2.5 px-4 rounded-lg transition-colors text-xs font-semibold tracking-wide uppercase cursor-pointer disabled:opacity-50',
  cancelButton:
    'w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 sm:py-2 px-4 rounded-lg transition-colors text-xs font-semibold cursor-pointer',
  successMessage:
    'bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-lg mb-4 text-xs font-medium',
  errorMessage:
    'bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-lg mb-4 text-xs font-medium',
} as const;