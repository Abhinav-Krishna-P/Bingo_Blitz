import type { BingoCard } from "@/types/game";

export const DEFAULT_BOARD_SIZE = 5;
export const BOARD_SIZE_OPTIONS = [5, 6, 7] as const;
export const LETTERS_TO_WIN = 5;
export const BINGO_LETTERS = ["B", "I", "N", "G", "O"] as const;

export function maxNumberFor(size: number) {
  return size * size;
}

export function generateBingoCard(size: number = DEFAULT_BOARD_SIZE): BingoCard {
  const max = maxNumberFor(size);
  const numbers = Array.from({ length: max }, (_, index) => index + 1);
  for (let i = numbers.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => numbers[row * size + col]),
  );
}

export function isCrossed(value: number, calledNumbers: number[]) {
  return calledNumbers.includes(value);
}

export function countCrossed(card: BingoCard, calledNumbers: number[]) {
  const set = new Set(calledNumbers);
  let count = 0;
  for (const row of card) {
    for (const value of row) {
      if (set.has(value)) count += 1;
    }
  }
  return count;
}

export function countCompletedLines(card: BingoCard, calledNumbers: number[]) {
  const size = card.length;
  if (!size) return 0;
  const set = new Set(calledNumbers);
  let lines = 0;

  for (let row = 0; row < size; row += 1) {
    if (card[row].every((value) => set.has(value))) lines += 1;
  }

  for (let col = 0; col < size; col += 1) {
    if (card.every((row) => set.has(row[col]))) lines += 1;
  }

  if (card.every((row, index) => set.has(row[index]))) lines += 1;
  if (card.every((row, index) => set.has(row[size - 1 - index]))) lines += 1;

  return lines;
}

export function lettersEarned(card: BingoCard, calledNumbers: number[]) {
  return Math.min(LETTERS_TO_WIN, countCompletedLines(card, calledNumbers));
}

export function hasWon(card: BingoCard, calledNumbers: number[]) {
  return countCompletedLines(card, calledNumbers) >= LETTERS_TO_WIN;
}

export function getCardPosition(card: BingoCard, value: number) {
  for (let row = 0; row < card.length; row += 1) {
    const col = card[row].indexOf(value);
    if (col !== -1) return { row, col };
  }
  return null;
}

