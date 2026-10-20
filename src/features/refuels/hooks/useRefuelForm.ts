// src/features/refuels/hooks/useRefuelForm.ts

import { useState } from 'react';
import { calculateLitersFromSpent } from '../services/refuelService';
import type { RefuelBoxInput } from '../../../shared/types';

interface UseRefuelFormProps {
  onSubmit: (data: RefuelBoxInput) => Promise<void>;
}

export function useRefuelForm({ onSubmit }: UseRefuelFormProps) {
  const [refuelDate, setRefuelDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [spentAmount, setSpentAmount] = useState<string>('');
  const [pricePerLiter, setPricePerLiter] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Calcolo derivato in tempo reale dei litri per feedback immediato all'utente
  const parsedSpent = parseFloat(spentAmount) || 0;
  const parsedPrice = parseFloat(pricePerLiter) || 0;
  const calculatedLiters = calculateLitersFromSpent(parsedSpent, parsedPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (parsedSpent <= 0 || parsedPrice <= 0) {
      setError('Inserisci valori validi maggiori di zero per spesa e prezzo al litro.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        refuel_date: refuelDate,
        spent_amount: parsedSpent,
        price_per_liter: parsedPrice,
        liters: calculatedLiters,
        notes: notes.trim() || undefined,
      });

      setSuccess(true);
      setSpentAmount('');
      setPricePerLiter('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio del rifornimento.');
    } finally {
      setLoading(false);
    }
  };

  return {
    refuelDate,
    setRefuelDate,
    spentAmount,
    setSpentAmount,
    pricePerLiter,
    setPricePerLiter,
    notes,
    setNotes,
    calculatedLiters,
    loading,
    error,
    success,
    handleSubmit,
  };
}