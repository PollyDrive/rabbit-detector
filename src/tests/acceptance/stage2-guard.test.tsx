import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 2 location/type guard', () => {
  it('hides invalid event types for a clicked zone', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Огород' }))

    expect(screen.queryByRole('option', { name: 'Шуршание' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Датчик движения' })).not.toBeInTheDocument()
  })
})
