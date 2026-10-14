import { describe, expect, it } from 'vitest'
import { facebookShareUrl, reportPublicUrl, reportReturnPath, safeReturnPath } from '@/lib/reportInteraction'

describe('report interaction URLs', () => {
  it('returns to the comment section after authentication', () => {
    expect(reportReturnPath('report-123', 'comment')).toBe('/reports/report-123#comments')
    expect(reportReturnPath('report-123', 'support')).toBe('/reports/report-123')
  })

  it('shares the public report URL using the current origin', () => {
    const url = reportPublicUrl('report-123', 'https://fixkh.example')
    expect(url).toBe('https://fixkh.example/reports/report-123')
    expect(facebookShareUrl(url)).toBe(
      'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Ffixkh.example%2Freports%2Freport-123',
    )
  })

  it('rejects external or malformed post-login destinations', () => {
    expect(safeReturnPath('/reports/report-123#comments')).toBe('/reports/report-123#comments')
    expect(safeReturnPath('//other.example/path')).toBe('/feed')
    expect(safeReturnPath('https://other.example')).toBe('/feed')
    expect(safeReturnPath('/\\other.example')).toBe('/feed')
  })
})
