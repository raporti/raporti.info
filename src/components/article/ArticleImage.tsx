"use client";

import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export default function ArticleImage({ src, alt, className = "", fallbackText = "R" }: Props) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}>
        <span className="text-4xl font-extrabold text-gray-300">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
