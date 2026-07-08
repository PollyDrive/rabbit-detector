import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 2 event log panel', () => {
  it('renders appended rows and exposes no edit or delete controls', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Огород' }))
    fireEvent.change(screen.getByLabelText(/тип события/i), {
      target: { value: 'Следы' },
    })
    fireEvent.change(screen.getByLabelText(/интенсивность/i), {
      target: { value: '9' },
    })
    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))

    expect(screen.getByText(/лог событий/i)).toBeVisible()
    expect(screen.getByText(/#1/)).toBeVisible()
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })
})
