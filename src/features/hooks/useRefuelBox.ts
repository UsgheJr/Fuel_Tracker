import { useState } from 'react';
import type { RefuelBox } from '../../shared/types/index';

interface UseRefuelBoxProps {
  refuelBoxes: RefuelBox[];
  onAddRefuelBox: (box: RefuelBox) => void;
  onUpdateRefuelBox: (updatedBox: RefuelBox) => void;
}

export function useRefuelBox({ refuelBoxes, onAddRefuelBox, onUpdateRefuelBox }: UseRefuelBoxProps) {
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
    const parsedPrice = parseFloat(price.replace(',', '.'));
    const parsedSpent = spentAmount ? parseFloat(spentAmount.replace(',', '.')) : undefined;

    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    const calculatedLiters = parsedSpent && parsedSpent > 0 ? parsedSpent / parsedPrice : undefined;
    const timePart = time ? time : '00:00';
    const combinedDateTime = new Date(`${date}T${timePart}:00`).toISOString();

    if (editingId) {
      const existing = refuelBoxes.find(b => b.id === editingId);
      if (existing) {
        onUpdateRefuelBox({
          ...existing,
          fuel_price_per_liter: parsedPrice,
          spent_amount: parsedSpent,
          liters_added: calculatedLiters,
          notes: notes || existing.notes,
          refuel_date: combinedDateTime,
        });
      }
      setEditingId(null);
    } else {
      const newBox: RefuelBox = {
        id: crypto.randomUUID(),
        refuel_date: combinedDateTime,
        fuel_price_per_liter: parsedPrice,
        spent_amount: parsedSpent,
        liters_added: calculatedLiters,
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
    setPrice(String(box.fuel_price_per_liter));
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