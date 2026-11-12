'use client'

import { useEffect, useState } from 'react'
import { formatIst } from '@/lib/time'

export function IstClock({ initial, iso }: { initial: string; iso: string }) {
  const [text, setText] = useState(initial)
  useEffect(() => {
    setText(formatIst(new Date()))
    const id = window.setInterval(() => setText(formatIst(new Date())), 30_000)
    return () => window.clearInterval(id)
  }, [])
  return <time dateTime={iso}>{text}</time>
}
