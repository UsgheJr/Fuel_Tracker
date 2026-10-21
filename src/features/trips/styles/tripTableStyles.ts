// src/features/trips/styles/tripTableStyles.ts

export const tripTableStyles = {
  container: 'overflow-x-auto bg-white shadow-sm rounded-xl border border-slate-200',
  toolbarWrapper: 'p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs',
  densityToggleContainer: 'inline-flex p-1 bg-slate-200 rounded-lg',
  densityButton: (isActive: boolean) =>
    `px-3 py-1.5 font-semibold rounded-md transition-colors cursor-pointer ${
      isActive ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
    }`,
  deleteButton: 'px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50',
  table: 'min-w-full divide-y divide-slate-200 text-left text-xs',
  header: 'bg-slate-50 text-slate-600 uppercase font-bold tracking-wider',
  th: 'px-4 py-3',
  td: 'px-4 py-3 text-slate-800',
  row: (isSelected: boolean) =>
    `transition-colors ${isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50/80'}`,
  checkbox: 'h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer',
  badgeCategory: 'px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full',
  badgeWarning: 'inline-block mt-1 px-2 py-0.5 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 rounded-md',
};