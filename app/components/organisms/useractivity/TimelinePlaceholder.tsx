import ContentLoader from 'react-content-loader'

export default function TimelinePlaceholder() {
  return (
    <ContentLoader viewBox="0 0 446 160" height={160} width={446}>
      <circle cx="19" cy="25" r="16" />
      <rect x="39" y="12" rx="5" ry="5" width="220" height="10" />
      <rect x="40" y="29" rx="5" ry="5" width="220" height="10" />

      <circle cx="19" cy="75" r="16" />
      <rect x="39" y="62" rx="5" ry="5" width="220" height="10" />
      <rect x="40" y="79" rx="5" ry="5" width="220" height="10" />

      <circle cx="19" cy="125" r="16" />
      <rect x="39" y="112" rx="5" ry="5" width="220" height="10" />
      <rect x="40" y="129" rx="5" ry="5" width="220" height="10" />
    </ContentLoader>
  );
}
