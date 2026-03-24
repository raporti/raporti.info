// Thumbnail generation using HTML Canvas (server-side with canvas package)
// Generates clean, light-themed news-style thumbnails matching site redesign

import { createCanvas } from "canvas";
import type { CanvasRenderingContext2D as NodeCanvasCtx } from "canvas";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const THUMB_WIDTH = 1200;
const THUMB_HEIGHT = 630;

const CATEGORY_COLORS: Record<string, string> = {
  botë: "#6366f1",
  politikë: "#8b5cf6",
  konflikt: "#dc2626",
  ekonomi: "#059669",
  teknologji: "#2563eb",
  sport: "#d97706",
  shëndetësi: "#db2777",
  shkencë: "#0d9488",
  kulturë: "#ea580c",
};

const URGENCY_COLORS: Record<string, string> = {
  breaking: "#dc2626",
  update: "#d97706",
  analysis: "#2563eb",
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

  // Clean white/light gray background
  const gradient = ctx.createLinearGradient(0, 0, THUMB_WIDTH, THUMB_HEIGHT);
  gradient.addColorStop(0, "#f8f9fa");
  gradient.addColorStop(1, "#e9ecef");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, THUMB_WIDTH, THUMB_HEIGHT);

  // Red accent bar at top
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(0, 0, THUMB_WIDTH, 6);

  // Subtle diagonal pattern for visual interest
  ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
  ctx.lineWidth = 1;
  for (let i = -THUMB_HEIGHT; i < THUMB_WIDTH; i += 60) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + THUMB_HEIGHT, THUMB_HEIGHT);
    ctx.stroke();
  }

  // Left accent stripe
  const catColor = CATEGORY_COLORS[category] || "#dc2626";
  ctx.fillStyle = catColor;
  ctx.fillRect(0, 0, 6, THUMB_HEIGHT);

  // Urgency badge
  const accentColor = URGENCY_COLORS[urgency] || "#dc2626";
  const urgencyLabel = URGENCY_LABELS[urgency] || "LAJM";
  ctx.font = "bold 16px sans-serif";
  const urgencyWidth = ctx.measureText(urgencyLabel).width + 28;
  ctx.fillStyle = accentColor;
  roundRect(ctx, 60, 50, urgencyWidth, 38, 4);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(urgencyLabel, 74, 75);

  // Category badge
  const catLabel = category.toUpperCase();
  ctx.font = "bold 14px sans-serif";
  const catWidth = ctx.measureText(catLabel).width + 24;
  ctx.fillStyle = catColor + "18";
  roundRect(ctx, 60 + urgencyWidth + 12, 50, catWidth, 38, 4);
  ctx.fill();
  ctx.fillStyle = catColor;
  ctx.fillText(catLabel, 60 + urgencyWidth + 24, 74);

  // Title text - dark, bold, authoritative
  ctx.fillStyle = "#111827";
  ctx.font = "bold 52px sans-serif";
  wrapText(ctx, title, 60, 155, THUMB_WIDTH - 120, 64, 4);

  // Bottom bar
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, THUMB_HEIGHT - 72, THUMB_WIDTH, 72);

  // Site name in bottom bar
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("RAPORTI", 60, THUMB_HEIGHT - 30);

  // Red dot after RAPORTI
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 30px sans-serif";
  const raportiWidth = ctx.measureText("RAPORTI").width;
  ctx.fillText(".", 60 + raportiWidth, THUMB_HEIGHT - 28);

  // Date in bottom bar
  const dateStr = formatAlbanianDate(date);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "16px sans-serif";
  const dateWidth = ctx.measureText(dateStr).width;
  ctx.fillText(dateStr, THUMB_WIDTH - 60 - dateWidth, THUMB_HEIGHT - 32);

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
