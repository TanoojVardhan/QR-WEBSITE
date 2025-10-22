"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function QRPage() {
  const [text, setText] = useState("https://maps.app.goo.gl/8UYXpegot3Ginzf97");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  async function generate() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw QR into canvas
    try {
      await QRCode.toCanvas(canvas, text, {
        errorCorrectionLevel: "H",
        color: { dark: fg, light: bg },
        margin: 2,
        scale: 6,
      });

      // If logo provided, draw it centered
      if (logoFile) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const img = await fileToImage(logoFile);
          // Resize logo to ~1/4 of QR size
          const logoSize = Math.floor(canvas.width / 4);
          const x = Math.floor((canvas.width - logoSize) / 2);
          const y = Math.floor((canvas.height - logoSize) / 2);

          // Draw white rounded background to improve contrast
          const radius = 8;
          ctx.fillStyle = bg;
          roundRect(ctx, x - 8, y - 8, logoSize + 16, logoSize + 16, radius);
          ctx.fill();

          // Draw image
          ctx.drawImage(img, x, y, logoSize, logoSize);
        }
      }

      const url = canvas.toDataURL("image/png");
      setDataUrl(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate QR: " + String(err));
    }
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function fileToImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = document.createElement('img');
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setLogoFile(f);
  }

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center py-8 px-2">
      <div className="text-center mb-8">
        <Image src="/next.svg" alt="Next.js" width={180} height={48} className="h-12 mx-auto mb-2" />
        <h1 className="text-4xl font-bold mb-2">QR Code Generator</h1>
        <p className="text-muted-foreground text-lg">Create custom QR codes with colors and logos</p>
      </div>
      <div className="flex flex-wrap gap-8 justify-center w-full max-w-5xl">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="text-xl font-bold">QR Code Settings</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <label className="font-bold">Data (URL or text)</label>
            <Input value={text} onChange={e => setText(e.target.value)} placeholder="Enter text or URL..." className="mb-2" />
            <div className="flex gap-4 items-center">
              <label className="font-bold flex flex-col items-center">
                Foreground
                <input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent" />
              </label>
              <label className="font-bold flex flex-col items-center">
                Background
                <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent" />
              </label>
              <label className="font-bold flex flex-col items-center">
                Logo
                <input type="file" accept="image/*" onChange={onLogoChange} className="w-32" />
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button onClick={generate}>Generate</Button>
            <Button variant="secondary" onClick={download} disabled={!dataUrl}>Download PNG</Button>
          </CardFooter>
        </Card>
        <Card className="w-full max-w-md flex flex-col items-center">
          <CardHeader>
            <h2 className="text-xl font-bold">Preview</h2>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <canvas ref={canvasRef} width={320} height={320} className="rounded shadow mb-2" />
            {dataUrl ? (
              <Image src={dataUrl} alt="qr" width={300} height={300} className="rounded shadow max-w-xs" />
            ) : (
              <div className="text-muted-foreground mt-2">Preview will appear here after generation</div>
            )}
          </CardContent>
        </Card>
      </div>
      <footer className="text-center text-muted-foreground mt-12 text-base">
        Made with Next.js, shadcn UI &amp; QRCode.js
      </footer>
    </main>
  );
}
