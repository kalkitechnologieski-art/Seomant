export function tokensMatch(left: string, right: string) {
  if (left.length !== right.length) return false
  let mismatch = 0
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index)
  return mismatch === 0
}

export function gateCookieValue(cookieHeader: string | null) {
  const parts = (cookieHeader ?? '').split(';').map((part) => part.trim())
  const found = parts.find((part) => part.startsWith('seoman_gate='))
  if (!found) return ''
  try {
    return decodeURIComponent(found.slice('seoman_gate='.length))
  } catch {
    return ''
  }
}

export function requestPassesGate(cookieHeader: string | null) {
  const gate = process.env.SEOMAN_GATE
  if (!gate) return true
  return tokensMatch(gateCookieValue(cookieHeader), gate)
}
