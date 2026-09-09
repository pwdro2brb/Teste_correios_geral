import type { ComponentProps } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchFieldProps extends ComponentProps<'input'> {
  containerClassName?: string
}

export function SearchField({ className, containerClassName, ...props }: SearchFieldProps) {
  return (
    <div className={cn('relative', containerClassName)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        {...props}
        className={cn(
          'h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring',
          className,
        )}
      />
    </div>
  )
}
