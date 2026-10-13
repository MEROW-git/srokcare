import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Report, ReportCategory, ReportStatus, SortOption } from '@/types/report'
import { reportService } from '@/services/reportService'
import { useTranslation } from '@/contexts/LanguageContext'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { ReportCard } from '@/components/reports/ReportCard'
import { ReportFilterBar } from '@/components/reports/ReportFilterBar'
import { SkeletonCard } from '@/components/common/SkeletonCard'
import { EmptyState } from '@/components/common/EmptyState'
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner'
import { useRealtimeEvents } from '@/hooks/useRealtimeEvents'

export const FeedPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [feedError, setFeedError] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)
  const [communityStats, setCommunityStats] = useState<{ total: number; resolved: number } | null>(null)
  const [highlightReports, setHighlightReports] = useState<Report[]>([])

  const fetchCommunityOverview = async () => {
    try {
      const [total, resolved, highlights] = await Promise.all([
        reportService.getReportCount(),
        reportService.getReportCount({ status: 'RESOLVED' }),
        reportService.getReports({ sortBy: 'most_supported' }),
      ])
      setCommunityStats({ total, resolved })
      setHighlightReports(highlights.slice(0, 4))
    } catch {
      setCommunityStats(null)
      setHighlightReports([])
    }
  }

  // Filter state synced with searchParams
  const categoryParam = (searchParams.get('category') as ReportCategory) || 'ALL'
  const statusParam = (searchParams.get('status') as ReportStatus) || 'ALL'
  const sortParam = (searchParams.get('sort') as SortOption) || 'latest'
  const searchParam = searchParams.get('q') || ''

  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'ALL'>(categoryParam)
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'ALL'>(statusParam)
  const [sortBy, setSortBy] = useState<SortOption>(sortParam)
  const [searchQuery, setSearchQuery] = useState(searchParam)

  const fetchReports = async () => {
    setLoading(true)
    try {
      const data = await reportService.getReports({
        category: selectedCategory,
        status: selectedStatus,
        sortBy,
        search: searchQuery,
      })
      const seen = new Set<string>()
      const unique = data.filter((r) => !seen.has(r.id) && seen.add(r.id))
      setReports(unique)
      setFeedError(false)
    } catch {
      setReports([])
      setFeedError(true)
    } finally {
      setLoading(false)
    }
  }

  const fetchReportsSilently = async () => {
    try {
      const data = await reportService.getReports({
        category: selectedCategory,
        status: selectedStatus,
        sortBy,
        search: searchQuery,
      })
      const seen = new Set<string>()
      const unique = data.filter((r) => !seen.has(r.id) && seen.add(r.id))
      setReports(unique)
    } catch (err) {
      console.warn('Realtime feed refresh notice:', err)
    }
  }

  useRealtimeEvents({
    topic: '/topic/reports',
    onRefresh: () => {
      void fetchReportsSilently()
      void fetchCommunityOverview()
    },
  })

  useEffect(() => {
    void fetchCommunityOverview()
  }, [])

  useEffect(() => {
    fetchReports()
  }, [selectedCategory, selectedStatus, sortBy, searchQuery])

  // Sync category changes
  const handleCategoryChange = (cat: ReportCategory | 'ALL') => {
    setSelectedCategory(cat)
    if (cat === 'ALL') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', cat)
    }
    setSearchParams(searchParams)
    setVisibleCount(6)
  }

  const handleStatusChange = (status: ReportStatus | 'ALL') => {
    setSelectedStatus(status)
    if (status === 'ALL') {
      searchParams.delete('status')
    } else {
      searchParams.set('status', status)
    }
    setSearchParams(searchParams)
    setVisibleCount(6)
  }

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort)
    searchParams.set('sort', sort)
    setSearchParams(searchParams)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    if (!query) {
      searchParams.delete('q')
    } else {
      searchParams.set('q', query)
    }
    setSearchParams(searchParams)
    setVisibleCount(6)
  }

  const handleReportUpdated = (updated: Report) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
  }

  const displayedReports = reports.slice(0, visibleCount)
  const hasMore = visibleCount < reports.length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-8 items-start">
        {/* Left Sidebar (Desktop) */}
        <div className="hidden lg:block">
          <LeftSidebar
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />
        </div>

        {/* Center Feed Column */}
        <main className="flex-1 min-w-0 space-y-5">
          <DisclaimerBanner compact />

          {/* Filter & Search Bar */}
          <ReportFilterBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />

          {/* Feed List */}
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : reports.length === 0 ? (
            <EmptyState
              title={feedError ? t('reportsUnavailable') : selectedCategory === 'ALL' && selectedStatus === 'ALL' && !searchQuery ? t('noCommunityReports') : t('noReportsFound')}
              description={feedError ? t('reportsUnavailableDesc') : selectedCategory === 'ALL' && selectedStatus === 'ALL' && !searchQuery ? t('noCommunityReportsDesc') : t('noReportsDesc')}
              actionLabel={feedError ? undefined : selectedCategory === 'ALL' && selectedStatus === 'ALL' && !searchQuery ? t('ctaReport') : t('resetFilters')}
              onAction={() => {
                if (selectedCategory === 'ALL' && selectedStatus === 'ALL' && !searchQuery) {
                  navigate('/reports/new')
                  return
                }
                setSelectedCategory('ALL')
                setSelectedStatus('ALL')
                setSearchQuery('')
                setSortBy('latest')
                setSearchParams({})
              }}
            />
          ) : (
            <div className="space-y-4">
              {displayedReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onReportUpdated={handleReportUpdated}
                />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-4 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="px-5 py-2 rounded-sm font-semibold text-xs bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-2xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors uppercase tracking-wider font-mono"
                  >
                    {t('loadMore')} ({reports.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar (Desktop) */}
        <div className="hidden xl:block">
          <RightSidebar
            trendingReports={highlightReports}
            stats={communityStats}
          />
        </div>
      </div>
    </div>
  )
}
