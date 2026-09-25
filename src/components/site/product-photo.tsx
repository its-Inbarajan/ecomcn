"use client";

import Image, { type ImageLoaderProps } from "next/image";

import { cn } from "@/lib/utils";

/**
 * Demo product photography from Unsplash, free to use under the Unsplash
 * License (https://unsplash.com/license). Served straight from Unsplash's
 * image CDN at the width each screen needs, so nothing is re-hosted, proxied
 * or counted against the site's image optimisation.
 *
 * Site code only. The blocks take any rendered element as their image and
 * never assume next/image.
 */
export type Photo = {
  /** The id in `images.unsplash.com/photo-<id>`. */
  id: string;
  /** Which edge to keep when the frame crops the photo. Defaults to the centre. */
  crop?: "left" | "right" | "top" | "bottom";
};

const unsplash =
  (aspect: string, crop?: Photo["crop"]) =>
  ({ src, width, quality }: ImageLoaderProps) =>
    `https://images.unsplash.com/photo-${src}?w=${width}&q=${quality ?? 75}&ar=${aspect}&fit=crop${
      crop ? `&crop=${crop}` : ""
    }&auto=format`;

export function ProductPhoto({
  photo,
  alt = "",
  aspect = "4:5",
  sizes = "(min-width: 1024px) 420px, (min-width: 640px) 45vw, 70vw",
  eager = false,
  className,
}: {
  photo: Photo;
  /** Empty by default: next to a product's name the photo is decorative. */
  alt?: string;
  /** Width:height of the frame, so the CDN crops instead of the browser. */
  aspect?: `${number}:${number}`;
  sizes?: string;
  /** Above the fold — skip lazy loading. */
  eager?: boolean;
  className?: string;
}) {
  return (
    <div className="relative size-full overflow-hidden bg-muted">
      <Image
        loader={unsplash(aspect, photo.crop)}
        src={photo.id}
        alt={alt}
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        className={cn("object-cover", className)}
      />
    </div>
  );
}
