import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 2 event model', () => {
  it('shows the full event payload after manual submit', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Огород' }))
    fireEvent.change(screen.getByLabelText(/тип события/i), {
      target: { value: 'Следы' },
    })
    fireEvent.change(screen.getByLabelText(/интенсивность/i), {
      target: { value: '7' },
    })
    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))

    expect(screen.getByText(/#1/)).toBeVisible()
    expect(screen.getByText('Огород')).toBeVisible()
    expect(screen.getByText('Следы')).toBeVisible()
    expect(screen.getByText('7')).toBeVisible()
    expect(screen.getByText(/manual/i)).toBeVisible()
  })
})
