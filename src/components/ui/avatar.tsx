import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { clsx } from 'clsx'

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string
  alt?: string
  /** Full name — used to derive initials when no image is provided */
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/** Consistent avatar colour derived from the name string */
function getAvatarColour(name?: string): string {
  const colours = [
    'bg-teal-600',
    'bg-amber-600',
    'bg-blue-600',
    'bg-purple-600',
    'bg-rose-600',
    'bg-green-600',
    'bg-indigo-600',
    'bg-orange-600',
  ]
  if (!name) return colours[0]
  const index = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colours[index % colours.length]
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, src, alt, name, size = 'md', ...props }, ref) => {
  const initials = getInitials(name)
  const colourClass = getAvatarColour(name)

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={clsx(
        'relative flex shrink-0 overflow-hidden rounded-full',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={alt ?? name ?? 'Avatar'}
          className="aspect-square h-full w-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        className={clsx(
          'flex h-full w-full items-center justify-center rounded-full font-semibold text-white',
          colourClass
        )}
        delayMs={src ? 600 : 0}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
})

Avatar.displayName = 'Avatar'

export { Avatar }
