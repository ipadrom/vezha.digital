import type Lenis from 'lenis'

export const useDesktopSmoothScroll = () => {
  let lenis: Lenis | null = null
  let desktopQuery: MediaQueryList | null = null
  let reducedMotionQuery: MediaQueryList | null = null
  let setupVersion = 0

  const destroy = () => {
    setupVersion += 1
    lenis?.destroy()
    lenis = null
    document.documentElement.removeAttribute('data-smooth-scroll')
  }

  const sync = async () => {
    const shouldRun = Boolean(desktopQuery?.matches && !reducedMotionQuery?.matches)
    if (!shouldRun) {
      destroy()
      return
    }
    if (lenis) return

    const version = ++setupVersion
    const { default: LenisConstructor } = await import('lenis')
    if (version !== setupVersion || !desktopQuery?.matches || reducedMotionQuery?.matches) return

    lenis = new LenisConstructor({
      autoRaf: true,
      lerp: 0.16,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      anchors: { offset: -86 },
    })
    document.documentElement.setAttribute('data-smooth-scroll', 'true')
  }

  onMounted(() => {
    desktopQuery = window.matchMedia('(min-width: 901px) and (pointer: fine)')
    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    desktopQuery.addEventListener('change', sync)
    reducedMotionQuery.addEventListener('change', sync)
    void sync()
  })

  onBeforeUnmount(() => {
    desktopQuery?.removeEventListener('change', sync)
    reducedMotionQuery?.removeEventListener('change', sync)
    destroy()
  })
}
