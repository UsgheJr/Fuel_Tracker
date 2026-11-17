export const pwaStyles = {
  wrapper: 'relative inline-flex items-center',
  installButton:
    'px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5',
  iosPopover:
    'absolute right-0 top-11 w-64 p-3 bg-white border border-slate-200 rounded-xl shadow-lg text-xs text-slate-700 z-50 space-y-1.5',
  iosPopoverHeader: 'flex items-center justify-between font-bold text-slate-900',
  closeBtn: 'text-slate-400 hover:text-slate-700 font-bold cursor-pointer',
} as const;