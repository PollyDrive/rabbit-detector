import { describe, expect, it } from 'vitest';
import { isValidLocationEventType } from '../../domain/events';

describe('isValidLocationEventType', () => {
  it('allows valid combinations', () => {
    expect(isValidLocationEventType('Огород', 'Следы')).toBe(true);
    expect(isValidLocationEventType('Теплица', 'Датчик движения')).toBe(true);
    expect(isValidLocationEventType('Забор — Восток', 'Шуршание')).toBe(true);
    expect(isValidLocationEventType('Сарай', 'Пропажа моркови')).toBe(true);
  });

  it('rejects invalid combinations', () => {
    expect(isValidLocationEventType('Огород', 'Шуршание')).toBe(false);
    expect(isValidLocationEventType('Огород', 'Датчик движения')).toBe(false);
    expect(isValidLocationEventType('Сарай', 'Следы')).toBe(false);
    expect(isValidLocationEventType('Сарай', 'Новая яма')).toBe(false);
    expect(isValidLocationEventType('Забор — Запад', 'Пропажа моркови')).toBe(false);
  });
});
