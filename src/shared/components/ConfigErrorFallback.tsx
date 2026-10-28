import React from 'react';

export const ConfigErrorFallback: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 max-w-md w-full space-y-4">
        <div className="text-amber-500 text-4xl">⚠️</div>
        <h2 className="text-lg font-bold text-slate-800">
          Configurazione Supabase Mancante
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Le variabili d'ambiente per connettersi a Supabase non sono state individuate.
        </p>
        <div className="bg-slate-50 p-3 rounded-lg text-left text-[11px] font-mono text-slate-700 space-y-1 border border-slate-200">
          <p className="font-semibold text-slate-900">Assicurati che nel file .env ci siano:</p>
          <p>VITE_SUPABASE_URL=https://...</p>
          <p>VITE_SUPABASE_ANON_KEY=eyJ...</p>
        </div>
        <p className="text-[11px] text-slate-400">
          Se sei su Vercel/Netlify, aggiungi le variabili nella sezione <strong>Environment Variables</strong> del tuo progetto.
        </p>
      </div>
    </div>
  );
};