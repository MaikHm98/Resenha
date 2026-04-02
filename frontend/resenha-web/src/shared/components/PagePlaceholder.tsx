type PagePlaceholderProps = {
  title: string
  description: string
  route: string
}

export function PagePlaceholder({
  title,
  description,
  route,
}: PagePlaceholderProps) {
  return (
    <section className="placeholder-card" aria-label={`Pagina ${title}`}>
      <p className="placeholder-route">Route: {route}</p>
      <h1 className="app-title">{title}</h1>
      <p className="app-subtitle">{description}</p>
    </section>
  )
}
