export function Seal({ size = 26 }: { size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="inline-grid place-items-center flex-none"
      aria-label="Verified"
    >
      <svg
        viewBox="0 0 40 40"
        width="100%"
        height="100%"
        style={{ filter: "drop-shadow(0 1px 1px rgba(201,155,46,.5))" }}
      >
        <circle
          cx="20"
          cy="20"
          r="17"
          fill="#F0C75E"
          stroke="#C99B2E"
          strokeWidth="2"
        />
        <path
          d="M13 20l5 5 9-10"
          fill="none"
          stroke="#0B3D2E"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
