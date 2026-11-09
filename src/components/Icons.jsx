// Простые линейные иконки. Декоративные: скрыты от скринридеров.
function Icon({ size = 20, className, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  )
}

export function IconSearch(props) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  )
}

export function IconClose(props) {
  return (
    <Icon {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  )
}

export function IconChevron(props) {
  return (
    <Icon {...props}>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  )
}

export function IconArrowLeft(props) {
  return (
    <Icon {...props}>
      <path d="M19 12H5m6-6-6 6 6 6" />
    </Icon>
  )
}

export function IconBox(props) {
  return (
    <Icon {...props}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </Icon>
  )
}

export function IconAlert(props) {
  return (
    <Icon {...props}>
      <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4m0 4h.01" />
    </Icon>
  )
}

// Логотип приложения: шестерёнка на акцентной плашке.
export function AppLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" focusable="false">
      <rect width="34" height="34" rx="9" fill="var(--app-accent)" />
      <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <circle cx="17" cy="17" r="4" />
        <path d="M17 7v3M17 24v3M7 17h3M24 17h3M9.9 9.9l2.1 2.1M22 22l2.1 2.1M9.9 24.1l2.1-2.1M22 12l2.1-2.1" />
      </g>
    </svg>
  )
}
