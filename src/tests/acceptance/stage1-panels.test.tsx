import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 1 control panels', () => {
  it('shows the control, dashboard, and overlay panels', () => {
    render(<App />)

    expect(screen.getByText('Симулятор')).toBeVisible()
    expect(screen.getByText('Дашборд')).toBeVisible()
    expect(screen.getByText("Параметры estimator'а")).toBeVisible()
    expect(screen.getByText('AI Worklog')).toBeVisible()
    expect(screen.getByText('Legend')).toBeVisible()
  })
})
