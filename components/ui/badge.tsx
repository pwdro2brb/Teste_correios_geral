import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        success: 'border-transparent bg-[oklch(0.92_0.05_150)] text-[oklch(0.4_0.1_150)]',
        warning: 'border-transparent bg-[oklch(0.94_0.06_85)] text-[oklch(0.45_0.1_75)]',
        danger: 'border-transparent bg-[oklch(0.93_0.05_25)] text-[oklch(0.5_0.18_25)]',
        info: 'border-transparent bg-[oklch(0.93_0.03_240)] text-[oklch(0.45_0.12_250)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
