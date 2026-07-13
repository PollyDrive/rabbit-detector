import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 1 control panels', () => {
  it('shows the control, dashboard, and legend panels', () => {
    render(<App />)

    expect(screen.getByText('Симулятор фермы')).toBeVisible()
    expect(screen.getByRole('region', { name: 'Дашборд' })).toBeVisible()
    expect(screen.getByText('Параметры сигналов')).toBeVisible()
    expect(screen.getByText('Правила фермы')).toBeVisible()
    expect(screen.getByRole('button', { name: 'AI Worklog' })).toBeVisible()
  })
})
