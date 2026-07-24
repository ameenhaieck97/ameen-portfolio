"use client";

import { toPng } from "html-to-image";
import jsPDF from "jspdf";

/** Screenshots the given DOM node (the actual rendered receipt) so exports always match the live web design pixel-for-pixel — no separate PDF layout to keep in sync. */
async function captureNode(node: HTMLElement) {
  return toPng(node, { pixelRatio: 2, backgroundColor: "#343131" });
}

export async function exportNodeAsPng(node: HTMLElement, filename: string) {
  const dataUrl = await captureNode(node);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export async function exportNodeAsPdf(node: HTMLElement, filename: string) {
  const dataUrl = await captureNode(node);
  const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
  const doc = new jsPDF({ unit: "px", format: [width, height] });
  doc.addImage(dataUrl, "PNG", 0, 0, width, height);
  doc.save(filename);
}
