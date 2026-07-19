import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ToolGrid from './ToolGrid'

function renderGrid() {
  return render(
    <MemoryRouter>
      <ToolGrid />
    </MemoryRouter>,
  )
}

describe('ToolGrid', () => {
  it('renders an available tool as a link to its route', () => {
    renderGrid()
    const merge = screen.getByRole('link', { name: /merge/i })
    expect(merge).toHaveAttribute('href', '/merge')
  })

  it('renders an unavailable tool as a disabled, non-link card', () => {
    renderGrid()
    expect(screen.queryByRole('link', { name: /compress/i })).toBeNull()
    const heading = screen.getByText('Compress')
    expect(heading.closest('[aria-disabled="true"]')).not.toBeNull()
  })
})
