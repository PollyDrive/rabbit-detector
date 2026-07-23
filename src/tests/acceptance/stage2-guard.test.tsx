import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 2 location/type guard', () => {
  it('offers only the valid event types for a clicked zone', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Огород' }))

    // Positive assertions first — if the type dropdown doesn't exist at
    // all yet, these fail loudly instead of the negative checks below
    // passing vacuously on an empty/missing list.
    expect(screen.getByRole('option', { name: 'Следы' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Пропажа морковки' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Новая яма' })).toBeInTheDocument()

    expect(screen.queryByRole('option', { name: 'Шуршание' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Датчик движения' })).not.toBeInTheDocument()
  })
})
