// Thumbnail generation using HTML Canvas (server-side with canvas package)
// Generates dark-themed breaking-news style thumbnails

import { createCanvas } from "canvas";
import type { CanvasRenderingContext2D as NodeCanvasCtx } from "canvas";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const THUMB_WIDTH = 1200;
const THUMB_HEIGHT = 630;

const CATEGORY_COLORS: Record<string, string> = {
  botë: "#6366f1",
  politikë: "#8b5cf6",
  konflikt: "#ef4444",
  ekonomi: "#10b981",
  teknologji: "#3b82f6",
  sport: "#f59e0b",
  shëndetësi: "#ec4899",
  shkencë: "#14b8a6",
  kulturë: "#f97316",
};

const URGENCY_COLORS: Record<string, string> = {
  breaking: "#ef4444",
  update: "#f59e0b",
  analysis: "#3b82f6",
};

const URGENCY_LABELS: Record<string, string> = {
  breaking: "LAJM I FUNDIT",
  update: "PËRDITËSIM",
  analysis: "ANALIZË",
};

export async function generateThumbnail(
  title: string,
  category: string,
  urgency: string,
  date: Date,
  slug: string
): Promise<string> {
  const canvas = createCanvas(THUMB_WIDTH, THUMB_HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, THUMB_WIDTH, THUMB_HEIGHT);
  gradient.addColorStop(0, "#0a0a1a");
  gradient.addColorStop(0.5, "#111128");
  gradient.addColorStop(1, "#0a0a1a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, THUMB_WIDTH, THUMB_HEIGHT);

  // Subtle grid pattern
  ctx.strokeStyle = "rgba(99, 102, 241, 0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < THUMB_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, THUMB_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < THUMB_HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(THUMB_WIDTH, y);
    ctx.stroke();
  }

  // Accent line at top
  const accentColor = URGENCY_COLORS[urgency] || "#6366f1";
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 0, THUMB_WIDTH, 4);

  // Urgency badge
  const urgencyLabel = URGENCY_LABELS[urgency] || "LAJM";
  ctx.font = "bold 16px sans-serif";
  const urgencyWidth = ctx.measureText(urgencyLabel).width + 24;
  ctx.fillStyle = accentColor;
  roundRect(ctx, 60, 60, urgencyWidth, 36, 4);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(urgencyLabel, 72, 84);

  // Category badge
  const catColor = CATEGORY_COLORS[category] || "#6366f1";
  const catLabel = category.toUpperCase();
  ctx.font = "bold 14px sans-serif";
  const catWidth = ctx.measureText(catLabel).width + 20;
  ctx.fillStyle = catColor + "30";
  ctx.strokeStyle = catColor;
  ctx.lineWidth = 1;
  roundRect(ctx, 60 + urgencyWidth + 12, 60, catWidth, 36, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = catColor;
  ctx.fillText(catLabel, 60 + urgencyWidth + 22, 83);

  // Title text
  ctx.fillStyle = "#f0f0f5";
  ctx.font = "bold 48px sans-serif";
  wrapText(ctx, title, 60, 160, THUMB_WIDTH - 120, 58, 4);

  // Bottom bar
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(0, THUMB_HEIGHT - 80, THUMB_WIDTH, 80);

  // Site name
  ctx.fillStyle = "#6366f1";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("RAPORTI", 60, THUMB_HEIGHT - 38);

  // Date
  const dateStr = formatAlbanianDate(date);
  ctx.fillStyle = "#6b6b80";
  ctx.font = "16px sans-serif";
  const dateWidth = ctx.measureText(dateStr).width;
  ctx.fillText(dateStr, THUMB_WIDTH - 60 - dateWidth, THUMB_HEIGHT - 40);

  // Decorative dot
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(140, THUMB_HEIGHT - 42, 4, 0, Math.PI * 2);
  ctx.fill();

  // Save to file
  const dir = path.join(process.cwd(), "public", "thumbnails");
  await mkdir(dir, { recursive: true });
  const filename = `${slug}.png`;
  const filepath = path.join(dir, filename);
  const buffer = canvas.toBuffer("image/png");
  await writeFile(filepath, buffer);

  return `/thumbnails/${filename}`;
}

function roundRect(
  ctx: NodeCanvasCtx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(
  ctx: NodeCanvasCtx,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      lineCount++;
      if (lineCount >= maxLines) {
        // Truncate with ellipsis
        line = line.trim();
        if (line.length > 3) {
          line = line.substring(0, line.length - 3) + "...";
        }
        ctx.fillText(line, x, y);
        return;
      }
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

function formatAlbanianDate(date: Date): string {
  const months = [
    "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
    "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor",
  ];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${d} ${m} ${y}, ${h}:${min}`;
}

export { formatAlbanianDate };
