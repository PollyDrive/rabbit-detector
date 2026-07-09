import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 1 control panels', () => {
  it('shows the control, dashboard, and legend panels', () => {
    render(<App />)

    expect(screen.getByText('Симулятор')).toBeVisible()
    expect(screen.getByText('Дашборд')).toBeVisible()
    expect(screen.getByText("Параметры estimator'а")).toBeVisible()
    expect(screen.getByText('Правила фермы')).toBeVisible()
    expect(screen.getByRole('button', { name: 'AI Worklog' })).toBeVisible()
  })
})
