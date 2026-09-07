import type { ComponentProps } from "react";

/**
 * Demo artwork for the marketing page. ecomcn blocks take `image` as a
 * ReactNode precisely so they never assume next/image — this is what that
 * buys us, and it keeps the landing page free of network requests.
 */
const GROUNDS = {
  bottle: "hsl(38 26% 88%)",
  chair: "hsl(24 22% 84%)",
  lamp: "hsl(140 10% 85%)",
  tote: "hsl(30 18% 87%)",
  mug: "hsl(12 24% 88%)",
  boot: "hsl(200 12% 86%)",
} as const;

export type ArtKind = keyof typeof GROUNDS;

const PATHS: Record<ArtKind, React.ReactNode> = {
  bottle: (
    <>
      <path d="M86 22h28v20l14 22a34 34 0 0 1 6 19v75a10 10 0 0 1-10 10H76a10 10 0 0 1-10-10v-75a34 34 0 0 1 6-19l14-22V22Z" />
      <path d="M82 22h36M66 106h68" />
    </>
  ),
  chair: (
    <>
      <path d="M60 34h80v54H60z" />
      <path d="M60 88v76M140 88v76M46 108h108M78 60h44" />
    </>
  ),
  lamp: (
    <>
      <path d="M62 30h76l14 46H48l14-46Z" />
      <path d="M100 76v78" />
      <path d="M64 168h72l-10-14H74l-10 14Z" />
    </>
  ),
  tote: (
    <>
      <path d="M52 62h96l10 106H42L52 62Z" />
      <path d="M76 62V44a24 24 0 0 1 48 0v18M42 96h116" />
    </>
  ),
  mug: (
    <>
      <path d="M52 54h84v88a22 22 0 0 1-22 22H74a22 22 0 0 1-22-22V54Z" />
      <path d="M136 76h16a20 20 0 0 1 0 40h-16M52 82h84" />
    </>
  ),
  boot: (
    <>
      <path d="M62 26h44v70l38 30a26 26 0 0 1 10 21v17H62V26Z" />
      <path d="M62 96h44M62 150h92" />
    </>
  ),
};

export function ProductArt({
  kind,
  className,
  ...props
}: { kind: ArtKind } & ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={`${kind} illustration`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      {...props}
    >
      <rect width="200" height="200" fill={GROUNDS[kind]} />
      <g
        fill="none"
        stroke="hsl(30 9% 12%)"
        strokeWidth="2.25"
        strokeLinecap="square"
        opacity="0.86"
      >
        {PATHS[kind]}
      </g>
    </svg>
  );
}
