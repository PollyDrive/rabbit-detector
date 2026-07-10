import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuditLog } from '../../components/panels/AuditLog';
import { DashboardProjectionContext } from '../../context/DashboardProjectionContext';
import type { DashboardProjection } from '../../components/dashboard-board-utils';
import type { FarmEvent } from '../../domain/contract';

function createMockProjection(zones: DashboardProjection['zones']): DashboardProjection {
  return {
    low: 0,
    high: 0,
    pointEstimate: 0,
    confidencePercent: 0,
    recommendations: [],
    zones,
  };
}

describe('ZonesArea Explainability UI Unit Tests', () => {
  it('renders stable no-data text when there is no evidence and no signals', () => {
    const mockProjection = createMockProjection({
      'Теплица': {
        presence: 0,
        priority: 0,
        dominantSignal: '',
        urgencyLevel: 'нет активности',
        evidence: [],
        topSignals: [],
      },
      'Огород': {
        presence: 0,
        priority: 0,
        dominantSignal: '',
        urgencyLevel: 'нет активности',
        evidence: [],
        topSignals: [],
      },
    });

    render(
      <DashboardProjectionContext.Provider value={mockProjection}>
        <AuditLog />
      </DashboardProjectionContext.Provider>
    );

    const auditLog = screen.getByRole('region', { name: 'Журнал аудита' });
    expect(within(auditLog).getByText(/нет данных для объяснения|нет объяснения/i)).toBeInTheDocument();
    expect(within(auditLog).queryByRole('heading', { name: /доказательство количества/i })).not.toBeInTheDocument();
    expect(within(auditLog).queryByRole('heading', { name: /сильнейшие сигналы/i })).not.toBeInTheDocument();
  });

  it('renders evidence and top signals lists grouped by location when data is present', () => {
    const mockEvidenceEvent: FarmEvent = {
      id: 42,
      event_type: 'Следы',
      location: 'Сарай',
      intensity: 8,
      time: 500,
      source: 'manual',
    };

    const mockSignalEvent: FarmEvent = {
      id: 43,
      event_type: 'Шуршание',
      location: 'Сарай',
      intensity: 5,
      time: 501,
      source: 'manual',
    };

    const mockProjection = createMockProjection({
      'Сарай': {
        presence: 1,
        priority: 8,
        dominantSignal: 'Следы',
        urgencyLevel: 'высокий',
        evidence: [mockEvidenceEvent],
        topSignals: [mockEvidenceEvent, mockSignalEvent],
      },
    });

    render(
      <DashboardProjectionContext.Provider value={mockProjection}>
        <AuditLog />
      </DashboardProjectionContext.Provider>
    );

    const auditLog = screen.getByRole('region', { name: 'Журнал аудита' });

    // Assert evidence section renders correctly
    const evidenceSection = within(auditLog).getByRole('heading', { name: /доказательство количества/i }).parentElement!;
    expect(evidenceSection).not.toBeNull();
    expect(within(evidenceSection).getByText('Сарай')).toBeInTheDocument();
    expect(within(evidenceSection).getByText('Следы')).toBeInTheDocument();
    expect(within(evidenceSection).queryByText('Шуршание')).not.toBeInTheDocument();

    // Assert top signals section renders correctly
    const topSignalsSection = within(auditLog).getByRole('heading', { name: /сильнейшие сигналы/i }).parentElement!;
    expect(topSignalsSection).not.toBeNull();
    expect(within(topSignalsSection).getByText('Сарай')).toBeInTheDocument();
    expect(within(topSignalsSection).getByText('Следы')).toBeInTheDocument();
    expect(within(topSignalsSection).getByText('Шуршание')).toBeInTheDocument();
  });
});
