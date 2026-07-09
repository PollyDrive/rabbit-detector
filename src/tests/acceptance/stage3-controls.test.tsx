import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 3 session controls', () => {
  it('keeps manual zone input active while the simulator is stopped', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Огород' }))

    expect(screen.getByRole('dialog', { name: /ручной ввод/i })).toBeVisible()
  })

  it('disables manual zone input once the simulator is running', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /запустить/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Огород' }))

    expect(screen.queryByRole('dialog', { name: /ручной ввод/i })).not.toBeInTheDocument()
  })
})
