export interface Reading {
  id: string;
  title: string;
  description: string;
  gradeLevel: string;
  coverImage?: string;
  isActive: number;
}

export interface Character {
  id: string;
  readingId: string;
  name: string;
  description: string;
  image?: string;
}

export interface Value {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface Student {
  id: string;
  classId: string;
  name: string;
}

export interface RankingScore {
  valueId: string;
  score: number;
  justification?: string;
}

export interface CharacterAnalytics {
  id: string;
  name: string;
  description: string;
  image?: string;
  averageCompositeScore: number;
  valueScores: {
    valueId: string;
    valueName: string;
    averageScore: number;
  }[];
}
