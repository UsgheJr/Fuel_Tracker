// src/features/refuels/hooks/useRefuelBox.ts

import { useState } from 'react';
import type { RefuelBox } from '../../../shared/types/index';

interface UseRefuelBoxProps {
  refuelBoxes: RefuelBox[];
  currentUserId: string;
  onAddRefuelBox: (box: RefuelBox) => void;
  onUpdateRefuelBox: (updatedBox: RefuelBox) => void;
}

export function useRefuelBox({ refuelBoxes, currentUserId, onAddRefuelBox, onUpdateRefuelBox }: UseRefuelBoxProps) {
  const [price, setPrice] = useState<string>('');
  const [spentAmount, setSpentAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentTimeStr = today.toTimeString().slice(0, 5);

  const [date, setDate] = useState<string>(todayStr);
  const [time, setTime] = useState<string>(currentTimeStr);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price.replace(',', '.')) || 0;
    const parsedSpent = spentAmount ? parseFloat(spentAmount.replace(',', '.')) : 0;

    if (parsedPrice <= 0) return;

    // Calcolo sicuro dei litri con fallback numerico (evita 'undefined')
    const calculatedLiters = parsedSpent > 0 ? Number((parsedSpent / parsedPrice).toFixed(3)) : 0;
    
    const timePart = time ? time : '00:00';
    const combinedDateTime = new Date(`${date}T${timePart}:00`).toISOString();

    if (editingId) {
      const existing = refuelBoxes.find(b => b.id === editingId);
      if (existing) {
        onUpdateRefuelBox({
          ...existing,
          price_per_liter: parsedPrice,
          spent_amount: parsedSpent,
          liters: calculatedLiters,
          notes: notes || existing.notes,
          refuel_date: combinedDateTime,
        });
      }
      setEditingId(null);
    } else {
      const newBox: RefuelBox = {
        id: crypto.randomUUID(),
        user_id: currentUserId, // Obbligatorio per rispettare l'interfaccia RefuelBox
        refuel_date: combinedDateTime,
        price_per_liter: parsedPrice,
        spent_amount: parsedSpent,
        liters: calculatedLiters,
        notes: notes || 'Rifornimento standard',
      };
      onAddRefuelBox(newBox);
    }

    resetForm();
  };

  const resetForm = () => {
    setPrice('');
    setSpentAmount('');
    setNotes('');
    setDate(todayStr);
    setTime(currentTimeStr);
    setEditingId(null);
  };

  const startEdit = (box: RefuelBox) => {
    setEditingId(box.id);
    setPrice(String(box.price_per_liter));
    setSpentAmount(box.spent_amount ? String(box.spent_amount) : '');
    setNotes(box.notes || '');
    
    const d = new Date(box.refuel_date);
    setDate(d.toISOString().split('T')[0]);
    setTime(d.toTimeString().slice(0, 5));
  };

  return {
    price,
    setPrice,
    spentAmount,
    setSpentAmount,
    notes,
    setNotes,
    date,
    setDate,
    time,
    setTime,
    editingId,
    handleSubmit,
    resetForm,
    startEdit,
  };
}