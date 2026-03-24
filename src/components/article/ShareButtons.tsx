"use client";

import { useState } from "react";
import { Copy, Check, Twitter, Facebook } from "lucide-react";

interface Props {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-text-muted mr-1">Ndaje:</span>
      <button
        onClick={copyLink}
        className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
        title="Kopjo linkun"
      >
        {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
        title="Ndaje në X"
      >
        <Twitter className="w-4 h-4" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
        title="Ndaje në Facebook"
      >
        <Facebook className="w-4 h-4" />
      </a>
    </div>
  );
}
