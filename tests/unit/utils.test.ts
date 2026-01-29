/**
 * Unit tests for src/lib/utils.ts
 */
import { cn, formatDate, formatDateTime, truncateText } from '@/lib/utils'

// =============================================================================
// cn (classNames) Tests
// =============================================================================

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'active', false && 'disabled')
    expect(result).toBe('base active')
  })

  it('should handle undefined values', () => {
    const result = cn('base', undefined, 'end')
    expect(result).toBe('base end')
  })

  it('should merge Tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle array of classes', () => {
    const result = cn(['class1', 'class2'])
    expect(result).toBe('class1 class2')
  })
})

// =============================================================================
// formatDate Tests
// =============================================================================

describe('formatDate', () => {
  it('should format Date object to Japanese date', () => {
    const date = new Date('2024-01-15T10:30:00')
    const result = formatDate(date)
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/01/)
    expect(result).toMatch(/15/)
  })

  it('should format ISO string to Japanese date', () => {
    const result = formatDate('2024-03-20')
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/03/)
    expect(result).toMatch(/20/)
  })
})

// =============================================================================
// formatDateTime Tests
// =============================================================================

describe('formatDateTime', () => {
  it('should format Date object with time', () => {
    const date = new Date('2024-01-15T14:30:00')
    const result = formatDateTime(date)
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/01/)
    expect(result).toMatch(/15/)
  })

  it('should format ISO string with time', () => {
    const result = formatDateTime('2024-06-10T09:45:00')
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/06/)
    expect(result).toMatch(/10/)
  })
})

// =============================================================================
// truncateText Tests
// =============================================================================

describe('truncateText', () => {
  it('should not truncate short text', () => {
    const result = truncateText('Hello', 10)
    expect(result).toBe('Hello')
  })

  it('should truncate long text with ellipsis', () => {
    const result = truncateText('This is a very long text', 10)
    expect(result).toBe('This is a ...')
    expect(result.length).toBe(13)
  })

  it('should handle exact length', () => {
    const result = truncateText('Hello', 5)
    expect(result).toBe('Hello')
  })

  it('should handle empty string', () => {
    const result = truncateText('', 10)
    expect(result).toBe('')
  })

  it('should handle Japanese text', () => {
    const result = truncateText('これは日本語のテキストです', 6)
    expect(result).toBe('これは日本語...')
  })
})
