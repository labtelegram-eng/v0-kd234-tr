'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Toast,
  ToastProvider,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
} from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import '@/styles/notifications.css'

/**
 * GlobalToaster
 * - Glassy, gradient-accent toasts
 * - Subtle motion with reduced-motion safeguards
 * - Consistent across all pages when mounted in app/layout.tsx
 */
export function GlobalToaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, action, ...props }) => {
        const isDestructive = props.variant === 'destructive'
        const Icon = isDestructive ? AlertTriangle : title ? CheckCircle2 : Info

        return (
          <Toast
            key={id}
            {...props}
            className={cn(
              // Base glass card
              'fancy-toast group pointer-events-auto relative w-full select-none overflow-hidden rounded-2xl border',
              'bg-white/70 dark:bg-neutral-900/70 border-white/30 dark:border-white/10 backdrop-blur-xl',
              // Shadow and hover feel
              'shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-3',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2',
              'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
              'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform',
              'data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full',
              isDestructive && 'fancy-toast-destructive'
            )}
          >
            {/* Gradient accent bar */}
            <div className="fancy-accent" aria-hidden="true" />

            <div className="flex items-start gap-3 p-4 pr-10">
              <div className={cn(
                'mt-0.5 flex h-6 w-6 items-center justify-center rounded-full',
                isDestructive
                  ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 text-red-600 dark:text-red-400'
                  : 'bg-gradient-to-br from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400'
              )}>
                <Icon className="h-4 w-4" />
              </div>

              <div className="grid flex-1 gap-1">
                {title ? (
                  <ToastTitle className="text-sm font-semibold tracking-[-0.01em]">
                    {title}
                  </ToastTitle>
                ) : null}
                {description ? (
                  <ToastDescription className="text-[13px] leading-5 text-neutral-700 dark:text-neutral-300">
                    {description}
                  </ToastDescription>
                ) : null}
                {action ? (
                  <div className="mt-2">{action}</div>
                ) : null}
              </div>

              <ToastClose
                className={cn(
                  'absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full',
                  'text-neutral-700/80 hover:text-neutral-900 dark:text-neutral-300/80 dark:hover:text-white',
                  'hover:bg-white/50 dark:hover:bg-white/5 transition-colors'
                )}
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </ToastClose>
            </div>
          </Toast>
        )
      })}
      <ToastViewport
        className={cn(
          'fixed bottom-4 right-4 z-[1080] flex max-h-screen w-full flex-col gap-3 p-2',
          'sm:max-w-[420px]'
        )}
      />
    </ToastProvider>
  )
}

export default GlobalToaster
