import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { CravingsRoulette } from '../components/cravings-roulette'

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}))

describe('CravingsRoulette Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders correctly with title and decide button', () => {
    render(<CravingsRoulette />)
    
    expect(screen.getByText('What are you')).toBeInTheDocument()
    expect(screen.getByText('Yearning?')).toBeInTheDocument()
    expect(screen.getByText(/Decide For Me/i)).toBeInTheDocument()
  })

  it('renders all default food categories', () => {
    render(<CravingsRoulette />)
    
    expect(screen.getByText('Spicy')).toBeInTheDocument()
    expect(screen.getByText('Momos')).toBeInTheDocument()
    expect(screen.getByText('Sandwiches')).toBeInTheDocument()
    expect(screen.getByText('Drinks')).toBeInTheDocument()
    expect(screen.getByText('Healthy')).toBeInTheDocument()
    expect(screen.getByText('Sweet')).toBeInTheDocument()
    expect(screen.getByText('Non-Veg')).toBeInTheDocument()
    expect(screen.getByText('Thali')).toBeInTheDocument()
  })

  it('spins the roulette and selects a random category', async () => {
    render(<CravingsRoulette />)
    
    const spinButton = screen.getByText(/Decide For Me/i)
    fireEvent.click(spinButton)
    
    // Check that button shows spinning text
    expect(screen.getByText('Spinning...')).toBeInTheDocument()
    
    // Fast-forward fake timers for iterations
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    
    // Check that final result box is displayed
    expect(screen.getByText('Destiny Decided!')).toBeInTheDocument()
    expect(screen.getByText('Respin 🎰')).toBeInTheDocument()
  })
})
