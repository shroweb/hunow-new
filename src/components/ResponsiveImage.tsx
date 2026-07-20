import { img, imgWebp, imgSrcSet } from "@/data/seed";

interface ResponsiveImageProps {
  id: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
}

const DEFAULT_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
const SRC_WIDTHS = [400, 600, 800, 1200, 1600];

export function ResponsiveImage({
  id,
  alt,
  width,
  height,
  className = "",
  loading = "lazy",
  fetchPriority,
  sizes = DEFAULT_SIZES,
}: ResponsiveImageProps) {
  const webpSrc = imgWebp(id, width, height);
  const fallbackSrc = img(id, width, height);
  const srcSet = imgSrcSet(id, SRC_WIDTHS, height);

  // For non-Unsplash images, just use a plain img
  if (!webpSrc) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <picture>
      <source type="image/webp" srcSet={srcSet ?? webpSrc} sizes={sizes} />
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={className}
        {...(srcSet ? { srcSet } : {})}
        sizes={sizes}
      />
    </picture>
  );
}
