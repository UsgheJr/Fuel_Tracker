import { useState, useMemo, useCallback } from 'react';
import type { RefuelBox } from '../../../shared/types';

export interface MonthCursor {
  year: number;
  month: number; // 0-indexed (0 = Gennaio, 10 = Novembre)
}

export function useRefuelHistoryFilter(refuelBoxes: RefuelBox[]) {
  const [cursor, setCursor] = useState<MonthCursor>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  const goToPrevMonth = useCallback(() => {
    setCursor((prev) =>
      prev.month === 0
        ? { year: prev.year - 1, month: 11 }
        : { year: prev.year, month: prev.month - 1 }
    );
  }, []);

  const goToNextMonth = useCallback(() => {
    setCursor((prev) =>
      prev.month === 11
        ? { year: prev.year + 1, month: 0 }
        : { year: prev.year, month: prev.month + 1 }
    );
  }, []);

  const resetToCurrentMonth = useCallback(() => {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
  }, []);

  const formattedMonthLabel = useMemo(() => {
    const date = new Date(cursor.year, cursor.month, 1);
    return new Intl.DateTimeFormat('it-IT', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }, [cursor]);

  const filteredBoxes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return refuelBoxes
      .filter((box) => {
        const d = new Date(box.refuel_date);
        if (isNaN(d.getTime())) return false;

        const sameMonth =
          d.getFullYear() === cursor.year && d.getMonth() === cursor.month;
        if (!sameMonth) return false;

        if (normalizedQuery) {
          const noteMatch = (box.notes || '').toLowerCase().includes(normalizedQuery);
          const priceMatch = String(box.price_per_liter).includes(normalizedQuery);
          return noteMatch || priceMatch;
        }

        return true;
      })
      .sort((a, b) => new Date(b.refuel_date).getTime() - new Date(a.refuel_date).getTime());
  }, [refuelBoxes, cursor, searchQuery]);

  const monthlyTotals = useMemo(() => {
    return filteredBoxes.reduce(
      (acc, box) => {
        acc.totalSpent += box.spent_amount || 0;
        acc.totalLiters += box.liters || 0;
        return acc;
      },
      { totalSpent: 0, totalLiters: 0 }
    );
  }, [filteredBoxes]);

  return {
    formattedMonthLabel,
    goToPrevMonth,
    goToNextMonth,
    resetToCurrentMonth,
    searchQuery,
    setSearchQuery,
    filteredBoxes,
    monthlyTotals,
  };
}