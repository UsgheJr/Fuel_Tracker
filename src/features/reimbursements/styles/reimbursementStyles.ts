export const reimbursementStyles = {
  bannerWrapper:
    'bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4',
  kpiSection: 'space-y-1',
  kpiLabel: 'text-[11px] font-bold uppercase tracking-wider text-amber-800',
  kpiValueRow: 'flex items-baseline gap-3',
  kpiAmount: 'text-3xl font-black text-amber-700 tracking-tight',
  kpiSubtext: 'text-xs text-amber-900/70 font-medium',
  controlsGrid: 'flex flex-wrap items-center gap-2.5',
  boxSelect:
    'px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500',
  btnActionPrimary:
    'px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer disabled:opacity-40',
  btnActionSecondary:
    'px-3.5 py-2 bg-white hover:bg-amber-100/70 text-amber-900 border border-amber-300 text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-40',
  badgePending:
    'inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 rounded-full',
  badgeDone:
    'inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full',
  btnQuickSettle:
    'ml-2 px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-600 hover:bg-amber-700 text-white rounded-md transition cursor-pointer',
} as const;