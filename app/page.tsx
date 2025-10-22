
"use client";
// --- QR code generator main page ---
import React, { useRef, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [text, setText] = useState("");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState(320);
  const [sizeMode, setSizeMode] = useState("preset");
  const [customSize, setCustomSize] = useState(320);
  const [customUnit, setCustomUnit] = useState("px");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  async function generate() {
  // Only px is used for canvas, but UI allows other units for future extensibility
  const actualSize = sizeMode === "custom" ? customSize : size;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = actualSize;
    canvas.height = actualSize;
    try {
      await QRCode.toCanvas(canvas, text, {
        errorCorrectionLevel: "H",
        color: { dark: fg, light: bg },
        margin: 2,
        scale: Math.floor(actualSize / 53),
      });
      if (logoFile) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const img = await fileToImage(logoFile);
          const logoSize = Math.floor(canvas.width / 4);
          const x = Math.floor((canvas.width - logoSize) / 2);
          const y = Math.floor((canvas.height - logoSize) / 2);
          const radius = 8;
          ctx.fillStyle = bg;
          roundRect(ctx, x - 8, y - 8, logoSize + 16, logoSize + 16, radius);
          ctx.fill();
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
  {/* Removed Next.js logo */}
  <h1 className="text-4xl font-bold mb-2">QR GENERATOR</h1>
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
            <div className="flex gap-4 items-center flex-wrap">
              <label className="font-bold flex flex-col items-center">
                Foreground
                <input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent" />
              </label>
              <label className="font-bold flex flex-col items-center">
                Background
                <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent" />
              </label>
              <label className="font-bold flex flex-col items-center">
                Size
                <select
                  value={sizeMode === "custom" ? "custom" : String(size)}
                  onChange={e => {
                    if (e.target.value === "custom") {
                      setSizeMode("custom");
                    } else {
                      setSizeMode("preset");
                      setSize(Number(e.target.value));
                    }
                  }}
                  className="w-24 p-1 rounded border mb-1"
                >
                  <option value={160}>Small</option>
                  <option value={240}>Medium</option>
                  <option value={320}>Large</option>
                  <option value={480}>Extra Large</option>
                  <option value="custom">Custom</option>
                </select>
                {sizeMode === "custom" && (
                  <div className="flex gap-2 items-center mt-1">
                    <input
                      type="number"
                      min={80}
                      max={1024}
                      value={customSize}
                      placeholder="Custom size"
                      className="w-20 p-1 rounded border"
                      onChange={e => setCustomSize(Number(e.target.value))}
                    />
                    <select value={customUnit} onChange={e => setCustomUnit(e.target.value)} className="p-1 rounded border">
                      <option value="px">px</option>
                      <option value="in">in</option>
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                    </select>
                  </div>
                )}
              </label>
              <label className="font-bold flex flex-col items-center">
                Logo
                <div className="relative w-32">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onLogoChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                    style={{ padding: "6px 8px" }}
                  />
                </div>
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
            <canvas ref={canvasRef} width={sizeMode === "custom" ? customSize : size} height={sizeMode === "custom" ? customSize : size} className="rounded shadow mb-2" />
            {!dataUrl && (
              <div className="text-muted-foreground mt-2">Preview will appear here after generation</div>
            )}
          </CardContent>
        </Card>
      </div>
      <footer className="relative text-center text-muted-foreground mt-12 text-base">
        If this QR code doesn&apos;t work, just pretend it does. 😄
        <Image src="/Tanooj Logo.png" alt="logo" width={72} height={72} style={{position: "fixed", right: 16, bottom: 16, zIndex: 50, opacity: 0.85}} />
      </footer>
    </main>
  );
}
