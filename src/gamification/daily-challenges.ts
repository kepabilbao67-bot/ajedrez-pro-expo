import type { DailyChallenge, DailyChallengeKind } from './xp-types';

interface ChallengeTemplate {
  readonly kind: DailyChallengeKind;
  readonly title: string;
  readonly rewardXp: number;
}

const DAILY_TEMPLATES: readonly ChallengeTemplate[] = [
  { kind: 'game-completed', title: 'Completa una partida', rewardXp: 25 },
  { kind: 'analysis-completed', title: 'Analiza una partida', rewardXp: 20 },
  { kind: 'exercise-completed', title: 'Resuelve un ejercicio', rewardXp: 30 },
];

export function calendarDate(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function createDailyChallenge(date = calendarDate()): DailyChallenge {
  const dayIndex = Number(date.replaceAll('-', '')) % DAILY_TEMPLATES.length;
  const template = DAILY_TEMPLATES[dayIndex];
  return {
    id: `${date}-${template.kind}`,
    date,
    title: template.title,
    rewardXp: template.rewardXp,
    kind: template.kind,
    target: 1,
    progress: 0,
    completed: false,
  };
}

export function progressDailyChallenge(challenge: DailyChallenge, event: DailyChallengeKind): DailyChallenge {
  if (challenge.completed || challenge.kind !== event) return challenge;
  const progress = Math.min(challenge.target, challenge.progress + 1);
  return { ...challenge, progress, completed: progress >= challenge.target };
}
