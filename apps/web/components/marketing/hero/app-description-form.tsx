/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * app-description-form.tsx
 * Copyright (C) 2025 Nextify Limited
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 */
'use client'

import * as m from '@/paraglide/messages'
import { Textarea } from '@libra/ui/components/textarea'
import { cn } from '@libra/ui/lib/utils'
import { ArrowUpCircle, Loader2, Paperclip } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@libra/auth/auth-client'
import Image from 'next/image'
import { useAutoResizeTextarea } from '../../../lib/hooks/use-auto-resize-textarea'
import { getAllExamples } from './examples-panel'
import { useHeroProjectCreate } from './hooks/use-hero-project-create'
import { useHeroFileUpload } from './hooks/use-hero-file-upload'
import { HeroFilePreview } from './components/hero-file-preview'
import { HeroTypewriterEffect } from './components/hero-typewriter-effect'

/**
 * Simplified app description form component
 *
 */
export const AppDescriptionForm = () => {
  // State management
  const [appDescription, setAppDescription] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [showTypewriterEffect, setShowTypewriterEffect] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [uploadedFileDetails, setUploadedFileDetails] = useState<{ key: string; name: string; type: string } | null>(null)
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null)

  // Character limit constants
  const MAX_CHARACTERS = 500
  const WARNING_THRESHOLD = 0.8 // Show warning at 80% (400 characters)

  // Ref to store resetPlanId function for use in success callback
  const resetPlanIdRef = useRef<(() => void) | null>(null)

  // Authentication and routing
  const router = useRouter()
  const { data: session } = authClient.useSession()

  // Reset form state after successful project creation (defined early for use in useHeroProjectCreate)
  const handleProjectCreateSuccess = useCallback(() => {
    
    setAppDescription('')
    setUploadedFileDetails(null)
    setCurrentPlanId(null)
    // Call resetPlanId if available
    resetPlanIdRef.current?.()
  }, [])

  const { heroProjectCreate, isLoading } = useHeroProjectCreate(handleProjectCreateSuccess)

  // Use auto-resize textarea hook
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 120,
    maxHeight: 300,
  })

  // Handle file upload success
  const handleFileUploadSuccess = useCallback((fileDetails: { key: string; name: string; type: string }, planId: string) => {
    setUploadedFileDetails(fileDetails)
    setCurrentPlanId(planId)
    
  }, [])

  // Handle file removal
  const handleFileRemoved = useCallback(() => {
    setUploadedFileDetails(null)
    setCurrentPlanId(null)
  }, [])

  // Authentication check function
  const checkAuthAndExecute = useCallback((callback: () => void) => {
    if (!session?.user) {
      // Get current path for returnTo parameter
      const currentPath = window.location.pathname + window.location.search
      router.push(`/login?returnTo=${encodeURIComponent(currentPath)}`)
      return
    }
    // User is authenticated, execute the callback
    callback()
  }, [session?.user, router])

  // File upload hook
  const {
    fileInputRef,
    handleFileSelectClick,
    handleFileChange,
    handleRemoveUploadedFile,
    resetPlanId,
    uploadedFileName,
    previewImageUrl,
    isUploadingFile,
    isDeletingFile,
    uploadError,
  } = useHeroFileUpload({
    onFileUploadSuccess: handleFileUploadSuccess,
    onFileRemoved: handleFileRemoved,
  })



  // Typewriter effect config
  const typewriterBaseText = m['hero.form.typewriter_base']()
  const allExamples = getAllExamples()

  // Character count and validation helpers
  const characterCount = appDescription.length
  const isOverLimit = characterCount > MAX_CHARACTERS
  const isNearLimit = characterCount >= MAX_CHARACTERS * WARNING_THRESHOLD
  const isFormValid = appDescription.trim() && !isOverLimit

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setAppDescription(value)
    adjustHeight()

    // Update typewriter effect based on content
    if (value.length > 0) {
      setShowTypewriterEffect(false)
    } else if (!isInputFocused && !isHovering) {
      setShowTypewriterEffect(true)
    }
  }

  // Handle focus event
  const handleFocus = useCallback(() => {
    setIsInputFocused(true)
    setShowTypewriterEffect(false)
  }, [])

  const handleBlur = useCallback(() => {
    setIsInputFocused(false)
    if (appDescription.length === 0) {
      setShowTypewriterEffect(true)
    }
  }, [appDescription.length])

  // Mouse event handler
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    setShowTypewriterEffect(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    if (appDescription.length === 0 && !isInputFocused) {
      setShowTypewriterEffect(true)
    }
  }, [appDescription.length, isInputFocused])

  // Handle submit with authentication check
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Check both content and character limit
    if (isFormValid) {
      checkAuthAndExecute(() => {
        heroProjectCreate(appDescription, uploadedFileDetails, currentPlanId)
      })
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  // Store resetPlanId function in ref for use in success callback
  useEffect(() => {
    resetPlanIdRef.current = resetPlanId
  }, [resetPlanId])

  // Hydration detection
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return (
    <div className='animate-appear relative z-[100] flex flex-col items-center justify-center gap-4 w-full max-w-[520px] mt-4 opacity-0 delay-200'>
      <form className='flex w-full flex-col gap-3' onSubmit={handleSubmit}>
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="image/*"
          disabled={isUploadingFile || isDeletingFile || isLoading}
        />
        {/* File Upload Preview */}
        <HeroFilePreview
          previewImageUrl={previewImageUrl}
          uploadedFileName={uploadedFileName}
          isUploadingFile={isUploadingFile}
          isDeletingFile={isDeletingFile}
          uploadError={uploadError}
          isSubmitting={isLoading}
          onRemoveFile={handleRemoveUploadedFile}
        />

        <div className='relative w-full'>
          <div
            className={cn(
              'relative flex min-h-[120px] w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm transition-all duration-200',
              'focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20',
              isHovering && 'border-primary/30',
              // Error state styling when over character limit
              isOverLimit && 'border-red-500/50 focus-within:border-red-500/70 focus-within:ring-red-500/20'
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Typewriter Effect Display */}
            <div className="absolute inset-0 px-4 py-4 pointer-events-none text-left">
              <HeroTypewriterEffect
                baseText={typewriterBaseText}
                examples={allExamples}
                isActive={showTypewriterEffect}
                isInputFocused={isInputFocused}
                isHovering={isHovering}
                hasContent={appDescription.length > 0}
                className="text-sm"
              />
            </div>

            {/* Text input area */}
            <Textarea
              ref={textareaRef}
              value={appDescription}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={cn(
                'min-h-[120px] resize-none border-0 bg-transparent px-4 pt-4 pb-14 pr-16 text-sm text-left',
                'focus-visible:ring-0 focus-visible:ring-offset-0',
                'placeholder:text-muted-foreground/70'
              )}
              style={{ height: 'auto' }}
            />

            {/* Bottom toolbar - similar to AIInput_17 */}
            <div className='absolute bottom-3 left-3 right-3 flex items-center justify-between'>
              {/* Left attachment button */}
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  onClick={() => checkAuthAndExecute(handleFileSelectClick)}
                  disabled={isUploadingFile || isDeletingFile || isLoading}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                    'hover:bg-muted text-muted-foreground hover:text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    (isUploadingFile || isDeletingFile || isLoading) && 'opacity-50 cursor-not-allowed'
                  )}
                  title={isHydrated ? m['hero.form.add_attachment']() : 'Add attachment'}
                >
                  {(isUploadingFile || isDeletingFile) ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Paperclip className='h-4 w-4' />
                  )}
                </button>
                {/* <button
                  type="button"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                    "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  title="Figma Design"
                >
                  <Figma className="h-4 w-4" />
                </button> */}
              </div>

              {/* Character counter and submit button */}
              <div className='flex items-center gap-3'>
                {/* Default model badge */}
                <div
                  className={cn(
                    'hidden sm:flex items-center gap-1 rounded-full border border-border/60',
                    'bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground',
                    'backdrop-blur-sm select-none'
                  )}
                  title='Default model: GPT-5'
                >
                  <Image
                    src='/openai.svg'
                    alt='OpenAI'
                    width={14}
                    height={14}
                    className='dark:invert opacity-80'
                  />
                  <span className='font-medium'>GPT-5</span>
                </div>
                {/* Character counter - show when approaching or over limit */}
                {(isNearLimit || characterCount > 0) && (
                  <div className={cn(
                    'text-xs px-2 py-1 rounded-md transition-all duration-200',
                    'backdrop-blur-sm border',
                    isOverLimit
                      ? 'text-red-500 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                      : isNearLimit
                        ? 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
                        : 'text-muted-foreground bg-muted/50 border-border/50'
                  )}>
                    {characterCount}/{MAX_CHARACTERS}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type='submit'
                  disabled={!isFormValid || isLoading || isUploadingFile || isDeletingFile}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md transition-all',
                    isFormValid && !isUploadingFile && !isDeletingFile
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                  title={isHydrated ? m['hero.form.send']() : 'Send'}
                >
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <ArrowUpCircle className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>



        {/* Warning message when over character limit */}
        {isOverLimit && (
          <div className='mt-2 p-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'>
            <p className='text-xs text-red-600 dark:text-red-400 font-medium'>
              Description exceeds {MAX_CHARACTERS} character limit. Please shorten your text to submit.
            </p>
          </div>
        )}
      </form>

      <p className='text-muted-foreground text-xs mt-1'>
        {isHydrated ? m['hero.form.footer_text']() : 'Free and open source forever. Start building your product now.'}
      </p>
    </div>
  )
}
