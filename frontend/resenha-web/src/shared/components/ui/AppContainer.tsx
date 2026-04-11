import type { HTMLAttributes, ReactNode } from 'react'
import './ui.css'

export type AppContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function AppContainer({
  children,
  className,
  ...containerProps
}: AppContainerProps) {
  const classes = ['ui-container', className ?? ''].filter(Boolean).join(' ')

  return (
    <div className={classes} {...containerProps}>
      {children}
    </div>
  )
}
