import type { TimeControlPreset } from './clock-types';

export type { TimeControlPreset };

export const TIME_CONTROL_PRESETS: readonly TimeControlPreset[] = [
  // SIN RELOJ
  {
    id: 'none',
    name: 'Sin Reloj (Tiempo Libre)',
    category: 'none',
    baseMinutes: 0,
    incrementSeconds: 0,
    label: 'Sin límite',
    icon: '♾️',
  },

  // BULLET
  {
    id: 'bullet-1-0',
    name: 'Bullet 1+0',
    category: 'bullet',
    baseMinutes: 1,
    incrementSeconds: 0,
    label: '1 min',
    icon: '🚀',
  },
  {
    id: 'bullet-2-1',
    name: 'Bullet 2+1',
    category: 'bullet',
    baseMinutes: 2,
    incrementSeconds: 1,
    label: '2 min | 1s',
    icon: '⚡',
  },

  // BLITZ
  {
    id: 'blitz-3-0',
    name: 'Blitz 3+0',
    category: 'blitz',
    baseMinutes: 3,
    incrementSeconds: 0,
    label: '3 min',
    icon: '⚡',
  },
  {
    id: 'blitz-3-2',
    name: 'Blitz 3+2 Torneo',
    category: 'blitz',
    baseMinutes: 3,
    incrementSeconds: 2,
    label: '3 min | 2s',
    icon: '⚔️',
  },
  {
    id: 'blitz-5-0',
    name: 'Blitz 5+0',
    category: 'blitz',
    baseMinutes: 5,
    incrementSeconds: 0,
    label: '5 min',
    icon: '⏱️',
  },

  // RÁPIDAS
  {
    id: 'rapid-10-0',
    name: 'Rápida 10+0',
    category: 'rapid',
    baseMinutes: 10,
    incrementSeconds: 0,
    label: '10 min',
    icon: '🎯',
  },
  {
    id: 'rapid-15-10',
    name: 'Rápida 15+10 Torneo',
    category: 'rapid',
    baseMinutes: 15,
    incrementSeconds: 10,
    label: '15 min | 10s',
    icon: '🏆',
  },

  // CLÁSICAS
  {
    id: 'classical-30-0',
    name: 'Clásica 30+0',
    category: 'classical',
    baseMinutes: 30,
    incrementSeconds: 0,
    label: '30 min',
    icon: '🏛️',
  },

  // RELOJ DE ARENA (ESPECIAL)
  {
    id: 'hourglass-2-0',
    name: 'Reloj de Arena (2 min)',
    category: 'hourglass',
    baseMinutes: 2,
    incrementSeconds: 0,
    isHourglass: true,
    label: '2 min Transferible',
    icon: '⌛',
  },
] as const;

export function getPresetById(id: string): TimeControlPreset {
  const found = TIME_CONTROL_PRESETS.find((p) => p.id === id);
  return found ?? TIME_CONTROL_PRESETS[0];
}
