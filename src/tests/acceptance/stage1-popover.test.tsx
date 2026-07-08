import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 1 zone popover', () => {
  it('opens a location-prefilled popover when a zone is clicked', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Огород' }))

    expect(screen.getByRole('dialog', { name: /ручной ввод/i })).toBeVisible()
    expect(screen.getByDisplayValue('Огород')).toBeVisible()
    expect(screen.queryByLabelText(/локация/i)).not.toBeInTheDocument()
  })
})
