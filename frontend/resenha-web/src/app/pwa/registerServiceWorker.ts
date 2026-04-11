export function registerServiceWorker() {
  if (!import.meta.env.PROD) {
    return
  }

  if (!('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // Falha de registro nao deve bloquear a aplicacao web.
    })
  })
}
