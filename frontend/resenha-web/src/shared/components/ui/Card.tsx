import type { HTMLAttributes, ReactNode } from 'react'
import './ui.css'

export type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  as?: 'article' | 'section' | 'div'
}

export function Card({
  as: Element = 'article',
  children,
  className,
  ...cardProps
}: CardProps) {
  const classes = ['ui-card', className ?? ''].filter(Boolean).join(' ')

  return (
    <Element className={classes} {...cardProps}>
      {children}
    </Element>
  )
}
