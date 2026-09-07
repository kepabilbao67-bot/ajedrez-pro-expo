import { describe, expect, it, vi } from 'vitest';

import { PremiumBadge } from '../premium-badge';
import { UsageMeter } from '../usage-meter';

// Mock de React Native para tests
vi.mock('react-native', () => {
  return {
    View: (props: any) => ({ type: 'View', props }),
    Text: (props: any) => ({ type: 'Text', props }),
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

// Tests para PremiumBadge
describe('PremiumBadge', () => {
  it('renderiza "PRO" cuando isPro=true', () => {
    const result = PremiumBadge({ isPro: true });
    const stringified = JSON.stringify(result);
    expect(stringified).toContain('PRO');
    expect(stringified).toContain('Usuario Pro');
  });

  it('renderiza "FREE" cuando isPro=false', () => {
    const result = PremiumBadge({ isPro: false });
    const stringified = JSON.stringify(result);
    expect(stringified).toContain('FREE');
    expect(stringified).toContain('Usuario Free');
  });

  it('renderiza variant="default" correctamente', () => {
    const result = PremiumBadge({ isPro: true, variant: 'default' });
    const stringified = JSON.stringify(result);
    expect(stringified).toContain('PRO');
  });

  it('renderiza variant="compact" correctamente', () => {
    const result = PremiumBadge({ isPro: false, variant: 'compact' });
    const stringified = JSON.stringify(result);
    expect(stringified).toContain('FREE');
  });

  it('renderiza variant="feature-lock" correctamente', () => {
    const result = PremiumBadge({ isPro: true, variant: 'feature-lock' });
    const stringified = JSON.stringify(result);
    expect(stringified).toContain('PRO');
  });

  it('tiene correcto accessibilityLabel para cada estado', () => {
    const proResult = PremiumBadge({ isPro: true });
    const freeResult = PremiumBadge({ isPro: false });

    expect(JSON.stringify(proResult)).toContain('Usuario Pro');
    expect(JSON.stringify(freeResult)).toContain('Usuario Free');
  });
});

// Tests para UsageMeter
describe('UsageMeter', () => {
  it('renderiza "X/Y usadas" cuando isPro=false', () => {
    const result = UsageMeter({ used: 2, max: 3, label: 'Pistas', isPro: false });
    const stringified = JSON.stringify(result);
    expect(stringified).toContain('2/3 usadas');
    expect(stringified).toContain('Pistas');
  });

  it('renderiza "Ilimitado ✨" cuando isPro=true', () => {
    const result = UsageMeter({ used: 0, max: 3, label: 'Pistas', isPro: true });
    const stringified = JSON.stringify(result);
    expect(stringified).toContain('Ilimitado ✨');
  });

  it('muestra "Límite diario alcanzado" cuando used >= max en modo Free', () => {
    const result = UsageMeter({ used: 3, max: 3, label: 'Pistas', isPro: false });
    const stringified = JSON.stringify(result);
    expect(stringified).toContain('Límite diario alcanzado');
  });

  it('NO muestra "Límite diario alcanzado" cuando used < max', () => {
    const result = UsageMeter({ used: 2, max: 3, label: 'Pistas', isPro: false });
    const stringified = JSON.stringify(result);
    expect(stringified).not.toContain('Límite diario alcanzado');
  });

  it('NO muestra barra de progreso cuando isPro=true', () => {
    const result = UsageMeter({ used: 5, max: 3, label: 'Pistas', isPro: true });
    const stringified = JSON.stringify(result);
    expect(stringified).toContain('Ilimitado ✨');
    expect(stringified).toContain('Desbloquea todas las funcionalidades Premium');
  });

  it('tiene correcto accessibilityLabel para contador', () => {
    const result = UsageMeter({ used: 2, max: 3, label: 'Análisis', isPro: false });
    const stringified = JSON.stringify(result);
    expect(stringified).toContain('Análisis: 2/3 usadas');
  });
});