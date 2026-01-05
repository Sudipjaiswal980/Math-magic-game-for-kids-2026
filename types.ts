
export type MathOperation = 'addition' | 'subtraction' | 'multiplication' | 'division';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface MathProblem {
  id: string;
  num1: number;
  num2: number;
  operation: MathOperation;
  answer: number;
  story?: string;
  character?: string;
  reward?: string;
}

export interface UserStats {
  correct: number;
  total: number;
  streak: number;
  highestStreak: number;
  // Levels are tracked per operation. The cap is determined by current difficulty.
  levels: Record<MathOperation, number>;
}

export interface GameState {
  currentProblem: MathProblem | null;
  userAnswer: string;
  isCorrect: boolean | null;
  feedback: string;
  rewardImage: string | null;
  isLoading: boolean;
}
