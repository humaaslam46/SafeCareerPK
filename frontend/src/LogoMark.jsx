export default function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="scpk-grad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F7DFB" />
          <stop offset="100%" stopColor="#12D4A8" />
        </linearGradient>
      </defs>
      {/* Hexagon badge - deliberately not a circle/stamp shape */}
      <path
        d="M32 3L57 17.5V46.5L32 61L7 46.5V17.5L32 3Z"
        fill="url(#scpk-grad)"
        opacity="0.16"
      />
      <path
        d="M32 5L55 18V45L32 58L9 45V18L32 5Z"
        stroke="url(#scpk-grad)"
        strokeWidth="2.5"
      />
      {/* Ascending path (career growth) merging into a checkmark (verified/safe) */}
      <path
        d="M16 40L25 30L32 36L48 19"
        stroke="url(#scpk-grad)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="48" cy="19" r="3.4" fill="url(#scpk-grad)" />
    </svg>
  );
}