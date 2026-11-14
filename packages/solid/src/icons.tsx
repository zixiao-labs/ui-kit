export function Icon(props: {
  name: 'close' | 'check' | 'chevron' | 'plus' | 'minus' | 'search'
  class?: string
}) {
  const paths = {
    close: 'M6 6l12 12M6 18L18 6',
    check: 'M5 12l4 4L19 6',
    chevron: 'M6 9l6 6 6-6',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  }
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class}
    >
      <path d={paths[props.name]} />
    </svg>
  )
}
