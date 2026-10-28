export const tripCsvUploaderStyles = {
  container: (hasError: boolean) =>
    `p-4 border-2 border-dashed rounded-xl text-center bg-white shadow-2xs transition-colors ${
      hasError ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 hover:border-indigo-400'
    }`,
  label: 'mb-2 text-xs font-semibold text-slate-600 block',
  input:
    'block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer',
  errorMessage: 'mt-2 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg',
};