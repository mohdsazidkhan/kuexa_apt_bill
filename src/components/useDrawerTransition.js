import { useEffect, useState } from 'react'

/**
 * Slide-in / slide-out state for a right-side drawer.
 *
 * A drawer that returns null until it is open mounts already at its final
 * position, so the transform has nothing to animate from — it pops in like a
 * modal and disappears the moment it closes. This keeps the panel in the DOM for
 * a frame at translate-x-full before sliding it in, and for the length of the
 * transition on the way back out.
 *
 * `payload` is the record the drawer renders (a customer, an offer, …). It is
 * held on to while the drawer slides shut, so the content doesn't blank out
 * mid-animation when the parent clears its state.
 *
 *   const { mounted, shown, value: offer } = useDrawerTransition(open, offerProp)
 *   if (!mounted || !offer) return null
 *   … className={shown ? 'translate-x-0' : 'translate-x-full'}
 */
export default function useDrawerTransition(open, payload = null, duration = 300) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const [value, setValue] = useState(payload)

  useEffect(() => {
    if (payload != null) setValue(payload)
  }, [payload])

  useEffect(() => {
    if (open) {
      setMounted(true)
      // Two frames: the first paints the panel off-screen, the second slides it in.
      let inner
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true))
      })
      return () => {
        cancelAnimationFrame(outer)
        if (inner) cancelAnimationFrame(inner)
      }
    }
    setShown(false)
    const t = setTimeout(() => setMounted(false), duration)
    return () => clearTimeout(t)
  }, [open, duration])

  return { mounted, shown, value }
}
