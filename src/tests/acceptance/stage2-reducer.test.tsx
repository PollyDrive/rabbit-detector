import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 2 append-only reducer', () => {
  it('keeps earlier log rows untouched when a second event is added', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Огород' }))
    fireEvent.change(screen.getByLabelText(/тип события/i), {
      target: { value: 'Следы' },
    })
    fireEvent.change(screen.getByLabelText(/интенсивность/i), {
      target: { value: '5' },
    })
    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))

    fireEvent.click(screen.getByRole('button', { name: 'Теплица' }))
    fireEvent.change(screen.getByLabelText(/тип события/i), {
      target: { value: 'Шуршание' },
    })
    fireEvent.change(screen.getByLabelText(/интенсивность/i), {
      target: { value: '8' },
    })
    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))

    expect(screen.getByText(/#1/)).toBeVisible()
    expect(screen.getByText(/#2/)).toBeVisible()
    expect(screen.getByText('Огород')).toBeVisible()
    expect(screen.getByText('Теплица')).toBeVisible()
  })
})
