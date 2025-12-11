import React from 'react';

export interface Candidate {
  id: string;
  name: string;
  imgUrl: string;
  file?: File;
  rotation?: number;
}

export type GamePhase = 'setup' | 'playing' | 'bye' | 'winner';

export interface GameMetadata {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Memory Game Types
export interface MemoryCard {
  id: string;      // Unique ID for the card instance
  pairId: string;  // ID to identify the matching pair
  type: 'text' | 'image';
  content: string; // Image URL or Text
  color: string;   // Neon color for the pair
  isFlipped: boolean;
  isMatched: boolean;
}