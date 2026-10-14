import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  AlertCircle,
  X,
  Check,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/contexts/LanguageContext'

export interface ImageCropModalProps {
  isOpen: boolean
  file: File | null
  cropType: 'avatar' | 'cover'
  onSave: (croppedFile: File) => Promise<void>
  onCancel: () => void
  triggerRef?: React.RefObject<HTMLElement | null>
}

// Aspect ratio constants
// Avatar: 1:1 square
// Cover: 8:3 (~2.67:1) wide banner matching profile cover banner
const COVER_ASPECT_RATIO = 8 / 3
const MIN_IMAGE_DIMENSION = 32
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  file,
  cropType,
  onSave,
  onCancel,
  triggerRef,
}) => {
  const { t } = useTranslation()

  // Modal element refs for accessibility
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  // Image load state
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Viewport dimensions (measured from DOM)
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: cropType === 'avatar' ? 280 : 480,
    height: cropType === 'avatar' ? 280 : 180,
  })

  // Transformation states
  const [zoom, setZoom] = useState<number>(1.0)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  // Dragging state
  const isDraggingRef = useRef<boolean>(false)
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const initialPinchDistanceRef = useRef<number | null>(null)
  const initialPinchZoomRef = useRef<number>(1.0)

  // Measure viewport size
  const updateViewportSize = useCallback(() => {
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setViewportSize({ width: rect.width, height: rect.height })
      }
    }
  }, [])

  // Calculate base scale to ensure image completely covers viewport at zoom=1.0
  const getScaleBase = useCallback(
    (nW: number, nH: number, vW: number, vH: number) => {
      return Math.max(vW / nW, vH / nH)
    },
    []
  )

  // Calculate pan boundaries for current zoom
  const getPanBounds = useCallback(
    (currentZoom: number) => {
      if (!naturalSize) return { maxX: 0, maxY: 0 }
      const scaleBase = getScaleBase(
        naturalSize.width,
        naturalSize.height,
        viewportSize.width,
        viewportSize.height
      )
      const currentScale = scaleBase * currentZoom
      const renderedWidth = naturalSize.width * currentScale
      const renderedHeight = naturalSize.height * currentScale

      const maxX = Math.max(0, (renderedWidth - viewportSize.width) / 2)
      const maxY = Math.max(0, (renderedHeight - viewportSize.height) / 2)
      return { maxX, maxY }
    },
    [naturalSize, viewportSize, getScaleBase]
  )

  // Clamp pan coordinates within bounds
  const clampPan = useCallback(
    (x: number, y: number, currentZoom: number) => {
      const { maxX, maxY } = getPanBounds(currentZoom)
      return {
        x: Math.min(maxX, Math.max(-maxX, x)),
        y: Math.min(maxY, Math.max(-maxY, y)),
      }
    },
    [getPanBounds]
  )

  // Save focus when opening and restore when closing
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = (triggerRef?.current || document.activeElement) as HTMLElement | null
      const timer = setTimeout(() => {
        viewportRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen, triggerRef])

  // Load image when file changes
  useEffect(() => {
    if (!isOpen || !file) {
      setImageSrc(null)
      setImageObj(null)
      setNaturalSize(null)
      setLoadError(null)
      setZoom(1.0)
      setPan({ x: 0, y: 0 })
      return
    }

    // Check size limit
    if (file.size > MAX_FILE_SIZE) {
      setLoadError(t('profileImageTooLarge'))
      return
    }

    // Check file type
    const validMimes = ['image/jpeg', 'image/png']
    if (!validMimes.includes(file.type)) {
      setLoadError(t('profileImageInvalid'))
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setImageSrc(objectUrl)
    setLoadError(null)

    const img = new Image()
    img.src = objectUrl

    img.onload = () => {
      if (img.naturalWidth < MIN_IMAGE_DIMENSION || img.naturalHeight < MIN_IMAGE_DIMENSION) {
        setLoadError(t('cropImageTooSmall'))
        return
      }
      setImageObj(img)
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
      setZoom(1.0)
      setPan({ x: 0, y: 0 })
    }

    img.onerror = () => {
      setLoadError(t('cropLoadFailed'))
    }

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [isOpen, file, t])

  // ResizeObserver to track responsive viewport changes
  useEffect(() => {
    if (!isOpen || !viewportRef.current) return
    updateViewportSize()

    const observer = new ResizeObserver(() => {
      updateViewportSize()
    })
    observer.observe(viewportRef.current)

    return () => observer.disconnect()
  }, [isOpen, updateViewportSize, cropType])

  // When viewport size changes or natural size is ready, re-clamp pan
  useEffect(() => {
    if (naturalSize) {
      setPan((prev) => clampPan(prev.x, prev.y, zoom))
    }
  }, [viewportSize, naturalSize, zoom, clampPan])

  // Zoom handler
  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.min(3.0, Math.max(1.0, Number(newZoom.toFixed(2))))
    setZoom(clampedZoom)
    setPan((prev) => clampPan(prev.x, prev.y, clampedZoom))
  }

  // Reset handler
  const handleReset = () => {
    setZoom(1.0)
    setPan({ x: 0, y: 0 })
  }

  // Pointer event handlers for panning & touch gestures
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isProcessing || loadError || !naturalSize) return
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (activePointersRef.current.size === 1) {
      isDraggingRef.current = true
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      panStartRef.current = { ...pan }
    } else if (activePointersRef.current.size === 2) {
      // Begin pinch
      isDraggingRef.current = false
      const pts = Array.from(activePointersRef.current.values())
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      initialPinchDistanceRef.current = dist
      initialPinchZoomRef.current = zoom
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(e.pointerId)) return
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (activePointersRef.current.size === 2 && initialPinchDistanceRef.current) {
      // Handle pinch zoom
      const pts = Array.from(activePointersRef.current.values())
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const ratio = currentDist / initialPinchDistanceRef.current
      const newZoom = initialPinchZoomRef.current * ratio
      handleZoomChange(newZoom)
      return
    }

    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    const targetX = panStartRef.current.x + dx
    const targetY = panStartRef.current.y + dy

    setPan(clampPan(targetX, targetY, zoom))
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId)
    if (activePointersRef.current.size < 2) {
      initialPinchDistanceRef.current = null
    }
    if (activePointersRef.current.size === 0) {
      isDraggingRef.current = false
    }
  }

  // Keyboard navigation for viewport
  const handleViewportKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isProcessing || loadError || !naturalSize) return
    const step = 15 // px

    let dx = 0
    let dy = 0

    switch (e.key) {
      case 'ArrowLeft':
        dx = -step
        break
      case 'ArrowRight':
        dx = step
        break
      case 'ArrowUp':
        dy = -step
        break
      case 'ArrowDown':
        dy = step
        break
      case '+':
      case '=':
        e.preventDefault()
        handleZoomChange(zoom + 0.1)
        return
      case '-':
      case '_':
        e.preventDefault()
        handleZoomChange(zoom - 0.1)
        return
      default:
        return
    }

    e.preventDefault()
    setPan((prev) => clampPan(prev.x + dx, prev.y + dy, zoom))
  }

  // Accessibility: modal escape and focus trap
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      if (!isProcessing) {
        onCancel()
      }
      return
    }

    if (e.key === 'Tab') {
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable || focusable.length === 0) return

      const firstElement = focusable[0]
      const lastElement = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  }

  // Export cropped canvas to file and call onSave
  const handleSave = async () => {
    if (!imageObj || !naturalSize || !file || isProcessing) return

    setIsProcessing(true)

    try {
      // Determine target output resolution
      const targetWidth = cropType === 'avatar' ? 512 : 1200
      const targetHeight =
        cropType === 'avatar' ? 512 : Math.round(1200 / COVER_ASPECT_RATIO)

      const scaleBase = getScaleBase(
        naturalSize.width,
        naturalSize.height,
        viewportSize.width,
        viewportSize.height
      )
      const currentScale = scaleBase * zoom

      // Source rectangle calculation in original image coordinate space
      const sw = viewportSize.width / currentScale
      const sh = viewportSize.height / currentScale
      const sx = naturalSize.width / 2 - (pan.x + viewportSize.width / 2) / currentScale
      const sy = naturalSize.height / 2 - (pan.y + viewportSize.height / 2) / currentScale

      // Ensure valid pixel sampling coordinates within bounds
      const safeSx = Math.max(0, Math.min(naturalSize.width - sw, sx))
      const safeSy = Math.max(0, Math.min(naturalSize.height - sh, sy))
      const safeSw = Math.min(sw, naturalSize.width - safeSx)
      const safeSh = Math.min(sh, naturalSize.height - safeSy)

      // Create offscreen canvas
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Canvas 2D context not available')
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(
        imageObj,
        safeSx,
        safeSy,
        safeSw,
        safeSh,
        0,
        0,
        targetWidth,
        targetHeight
      )

      // Determine output MIME format (match input file type: JPEG or PNG)
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const quality = mimeType === 'image/jpeg' ? 0.92 : undefined

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), mimeType, quality)
      })

      // Clean up canvas buffer immediately
      canvas.width = 0
      canvas.height = 0

      if (!blob) {
        throw new Error('Failed to generate image blob from canvas')
      }

      if (blob.size > MAX_FILE_SIZE) {
        toast.error(t('profileImageTooLarge'))
        setIsProcessing(false)
        return
      }

      const extension = mimeType === 'image/png' ? 'png' : 'jpg'
      const originalBaseName = file.name.replace(/\.[^/.]+$/, '')
      const croppedFile = new File([blob], `${originalBaseName}_cropped.${extension}`, {
        type: mimeType,
        lastModified: Date.now(),
      })

      await onSave(croppedFile)
    } catch (err: unknown) {
      console.error('Cropping export failed:', err)
      toast.error('Failed to process cropped image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  // Calculate rendered dimensions for the preview <img>
  let renderedWidth = 0
  let renderedHeight = 0
  if (naturalSize) {
    const scaleBase = getScaleBase(
      naturalSize.width,
      naturalSize.height,
      viewportSize.width,
      viewportSize.height
    )
    const currentScale = scaleBase * zoom
    renderedWidth = naturalSize.width * currentScale
    renderedHeight = naturalSize.height * currentScale
  }

  const modalTitle = cropType === 'avatar' ? t('cropAvatarTitle') : t('cropCoverTitle')

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-crop-modal-title"
      onKeyDown={handleModalKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-sm shadow-xl max-w-xl w-full flex flex-col overflow-hidden transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <h2
              id="image-crop-modal-title"
              className="text-sm font-bold uppercase tracking-wider text-slate-950 dark:text-white"
            >
              {modalTitle}
            </h2>
          </div>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onCancel}
            title={t('cropCancel')}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xs transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Crop Stage Body */}
        <div className="p-4 sm:p-6 flex flex-col items-center">
          {loadError ? (
            <div className="p-6 text-center my-4">
              <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 mb-4">
                {loadError}
              </p>
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xs transition-colors"
              >
                {t('cropCancel')}
              </button>
            </div>
          ) : (
            <>
              {/* Outer Crop Stage Container */}
              <div className="w-full flex justify-center items-center py-2 bg-slate-950/95 rounded-xs border border-slate-800 shadow-inner">
                {/* Crop Viewport */}
                <div
                  ref={viewportRef}
                  tabIndex={0}
                  role="region"
                  aria-label={t('cropDragHint')}
                  onKeyDown={handleViewportKeyDown}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  style={{
                    touchAction: 'none',
                    userSelect: 'none',
                  }}
                  className={`relative overflow-hidden cursor-grab active:cursor-grabbing focus:outline-hidden focus:ring-2 focus:ring-blue-500 rounded-xs border-2 border-blue-500/90 shadow-2xl ${
                    cropType === 'avatar'
                      ? 'w-64 h-64 sm:w-72 sm:h-72 aspect-square'
                      : 'w-full max-w-[480px] aspect-[8/3]'
                  }`}
                >
                  {/* Image being dragged/zoomed */}
                  {imageSrc && naturalSize && (
                    <img
                      src={imageSrc}
                      alt="Crop target"
                      draggable={false}
                      className="absolute pointer-events-none select-none max-w-none"
                      style={{
                        width: `${renderedWidth}px`,
                        height: `${renderedHeight}px`,
                        top: '50%',
                        left: '50%',
                        transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px))`,
                      }}
                    />
                  )}

                  {/* Rule-of-thirds alignment guide grid */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30 border border-white/20">
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-white/30" />
                    <div className="border-r border-white/30" />
                    <div />
                  </div>
                </div>
              </div>

              {/* Instructions and hints */}
              <div className="w-full flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 px-1">
                <span className="inline-flex items-center gap-1">
                  <Move className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{t('cropDragHint')}</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Zoom & Reset Controls */}
              <div className="w-full mt-3 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xs flex flex-wrap items-center justify-between gap-3">
                {/* Zoom controls */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => handleZoomChange(zoom - 0.1)}
                    disabled={zoom <= 1.0 || isProcessing}
                    title={t('cropZoomOut')}
                    aria-label={t('cropZoomOut')}
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xs border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="range"
                      min={1.0}
                      max={3.0}
                      step={0.01}
                      value={zoom}
                      onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                      disabled={isProcessing}
                      aria-label={t('cropZoom')}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-xs appearance-none cursor-pointer accent-blue-900 dark:accent-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleZoomChange(zoom + 0.1)}
                    disabled={zoom >= 3.0 || isProcessing}
                    title={t('cropZoomIn')}
                    aria-label={t('cropZoomIn')}
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xs border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isProcessing || (zoom === 1.0 && pan.x === 0 && pan.y === 0)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xs border border-slate-300 dark:border-slate-700 disabled:opacity-40 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('cropReset')}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs border border-slate-300 dark:border-slate-700 transition-colors disabled:opacity-50"
          >
            {t('cropCancel')}
          </button>
          <button
            type="button"
            disabled={isProcessing || !!loadError || !imageObj}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xs transition-colors shadow-2xs border border-blue-950 dark:border-blue-400 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('cropProcessing')}</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t('cropSave')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
