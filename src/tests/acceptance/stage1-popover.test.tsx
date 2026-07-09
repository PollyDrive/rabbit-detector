import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 1 zone popover', () => {
  it('opens a location-prefilled popover when a zone is clicked', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Огород' }))

    const dialog = screen.getByRole('dialog', { name: /ручной ввод/i })
    expect(dialog).toBeVisible()
    expect(within(dialog).getByRole('heading', { name: 'Огород' })).toBeVisible()
    expect(screen.queryByLabelText(/локация/i)).not.toBeInTheDocument()
  })
})
