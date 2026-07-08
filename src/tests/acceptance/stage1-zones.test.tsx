import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

const zoneLabels = [
  'Огород',
  'Теплица',
  'Сарай',
  'Забор — Запад',
  'Забор — Юго-Запад',
  'Забор — Восток',
  'Забор — Юго-Восток',
] as const

describe('stage 1 zone map', () => {
  it('renders seven clickable farm zones', () => {
    render(<App />)

    expect(screen.getAllByRole('button')).toHaveLength(7)

    for (const zoneLabel of zoneLabels) {
      expect(screen.getByRole('button', { name: zoneLabel })).toBeVisible()
    }
  })
})
