import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Admin QR Generator: creates a colorful neon QR that links to the Menu page
// Inspired by the attached image – dark background, cyan glow, corner accents, center label

const presets = [
  { name: "Neon Cyan", fg: "#00F7FF", glow: "#00F7FF" },
  { name: "Electric Purple", fg: "#A855F7", glow: "#A855F7" },
  { name: "Lime Glow", fg: "#84CC16", glow: "#84CC16" },
  { name: "Hot Pink", fg: "#F472B6", glow: "#F472B6" },
];

export default function AdminQR() {
  const navigate = useNavigate();
  const defaultUrl = useMemo(() => `${window.location.origin}/menu`, []);
  const [url, setUrl] = useState(defaultUrl);
  const [label, setLabel] = useState("LIVE");
  const [fgColor, setFgColor] = useState(presets[0].fg);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Logo and customization
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.22); // fraction of QR size
  const [logoPadding, setLogoPadding] = useState(8);
  const [logoBgShape, setLogoBgShape] = useState<"none" | "circle" | "square">("none");
  const [logoBgColor, setLogoBgColor] = useState("#ffffff");

  useEffect(() => {
    // ensure url always has protocol
    if (!/^https?:\/\//.test(url)) {
      setUrl(defaultUrl);
    }
  }, [defaultUrl]);

  // Convert uploaded logo file into a data URL
  const onLogoFileChange = (file: File | null) => {
    if (!file) {
      setLogoDataUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const QR_SIZE = 360;

  // Embed logo into the QR SVG string for export
  const injectLogoIntoSVG = (svgData: string) => {
    if (!logoDataUrl) return svgData;
    const size = QR_SIZE;
    const logoPx = Math.round(size * logoSize);
    const center = size / 2;
    const x = Math.round(center - logoPx / 2);
    const y = Math.round(center - logoPx / 2);
    let overlay = "";
    if (logoBgShape !== "none") {
      if (logoBgShape === "circle") {
        const r = Math.round(logoPx / 2 + logoPadding);
        overlay += `<circle cx="${center}" cy="${center}" r="${r}" fill="${logoBgColor}" />`;
      } else {
        const pad = logoPadding;
        const w = logoPx + pad * 2;
        const h = w;
        const xbg = Math.round(center - w / 2);
        const ybg = Math.round(center - h / 2);
        overlay += `<rect x="${xbg}" y="${ybg}" width="${w}" height="${h}" rx="10" fill="${logoBgColor}" />`;
      }
    }
    overlay += `<image href="${logoDataUrl}" x="${x}" y="${y}" width="${logoPx}" height="${logoPx}" preserveAspectRatio="xMidYMid meet" />`;
    return svgData.replace("</svg>", `<g id="qr-logo-overlay">${overlay}</g></svg>`);
  };

  const downloadSVG = () => {
    const node = containerRef.current?.querySelector("svg") as SVGSVGElement | null;
    if (!node) return;
    const svgData = new XMLSerializer().serializeToString(node);
    const svgWithLogo = injectLogoIntoSVG(svgData);
    const blob = new Blob([svgWithLogo], { type: "image/svg+xml;charset=utf-8" });
    const urlBlob = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlBlob;
    a.download = "menu-qr.svg";
    a.click();
    URL.revokeObjectURL(urlBlob);
  };

  const downloadPNG = async () => {
    const node = containerRef.current?.querySelector("svg") as SVGSVGElement | null;
    if (!node) return;
    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(node);
    const svgWithLogo = injectLogoIntoSVG(svgData);
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgWithLogo)}`;

    const img = new Image();
    img.src = svgUrl;
    await new Promise((res) => (img.onload = () => res(null)));

    const canvas = document.createElement("canvas");
    const S = 1024; // export size
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext("2d")!;
    // background
    ctx.fillStyle = "#0b0e11";
    ctx.fillRect(0, 0, S, S);
    ctx.drawImage(img, 0, 0, S, S);

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "menu-qr.png";
    a.click();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
        </Button>

        <div className="text-center mb-6 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Generate Menu QR</h1>
          <p className="text-muted-foreground">Share your menu with a modern, colorful QR</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <Card className="rounded-xl border bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Menu URL</label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourdomain.com/menu" />
                <p className="text-xs text-muted-foreground mt-1">Default uses your current origin + /menu</p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Center Label</label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="LIVE" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Style Presets</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <Button
                      key={p.name}
                      variant={fgColor === p.fg ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setFgColor(p.fg)}
                    >
                      <Sparkles className="h-4 w-4 mr-2" /> {p.name}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">You can print or download as PNG/SVG</p>

                {/* Custom color picker for flexibility */}
                <div className="mt-4 space-y-2">
                  <label className="text-sm text-muted-foreground">Custom QR Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-8 w-8 p-0 border rounded"
                    />
                    <Input value={fgColor} onChange={(e) => setFgColor(e.target.value)} placeholder="#00F7FF" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Center Logo</label>
                  <div className="mt-2 space-y-3">
                    <Input type="file" accept="image/*,.svg" onChange={(e)=>onLogoFileChange(e.target.files?.[0] ?? null)} />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Logo Size</label>
                        <input type="range" min={0.12} max={0.35} step={0.01} value={logoSize} onChange={(e)=>setLogoSize(parseFloat(e.target.value))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Padding</label>
                        <input type="range" min={0} max={24} step={1} value={logoPadding} onChange={(e)=>setLogoPadding(parseInt(e.target.value))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Background Shape</label>
                        <select className="border rounded h-9 px-2" value={logoBgShape} onChange={(e)=>setLogoBgShape(e.target.value as "none" | "circle" | "square")}>
                          <option value="none">None</option>
                          <option value="circle">Circle</option>
                          <option value="square">Rounded Square</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Background Color</label>
                        <input type="color" value={logoBgColor} onChange={(e)=>setLogoBgColor(e.target.value)} className="h-9 w-12 p-0 border rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={downloadPNG} className="gap-2">
                    <Download className="h-4 w-4" /> Download PNG
                  </Button>
                  <Button variant="outline" onClick={downloadSVG} className="gap-2">
                    <Download className="h-4 w-4" /> Download SVG
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border bg-card/70">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                {/* Neon QR container */}
                <div className="relative p-6 rounded-2xl bg-[#0b0e11] shadow-[0_0_50px_rgba(0,247,255,0.35)] ring-1 ring-[rgba(0,247,255,0.35)]">
                  {/* Corner glow accents */}
                  <span className="absolute -top-3 -left-3 h-8 w-8 rounded-sm ring-2 ring-[rgba(0,247,255,0.5)]" />
                  <span className="absolute -top-3 -right-3 h-8 w-8 rounded-sm ring-2 ring-[rgba(0,247,255,0.5)]" />
                  <span className="absolute -bottom-3 -left-3 h-8 w-8 rounded-sm ring-2 ring-[rgba(0,247,255,0.5)]" />
                  <span className="absolute -bottom-3 -right-3 h-8 w-8 rounded-sm ring-2 ring-[rgba(0,247,255,0.5)]" />

                  {/* QR itself as SVG so we can export */}
                  <div className="relative">
                    <div ref={containerRef}>
                      <QRCode
                        value={url}
                        size={360}
                        bgColor="transparent"
                        fgColor={fgColor}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={undefined}
                      />
                    </div>
                    {/* optional center logo overlay */}
                    {logoDataUrl && (
                      <div className="absolute inset-0 grid place-items-center pointer-events-none">
                        <div
                          style={{
                            backgroundColor: logoBgShape === "none" ? "transparent" : logoBgColor,
                            borderRadius: logoBgShape === "circle" ? "9999px" : logoBgShape === "square" ? "12px" : "0px",
                            padding: `${logoPadding}px`,
                          }}
                        >
                          <img
                            src={logoDataUrl}
                            alt="logo"
                            style={{
                              width: `${QR_SIZE * logoSize}px`,
                              height: `${QR_SIZE * logoSize}px`,
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {/* center label */}
                    {label && (
                      <div className="absolute inset-0 grid place-items-center pointer-events-none">
                        <span
                          className="font-bold tracking-wide"
                          style={{
                            color: fgColor,
                            textShadow: `0 0 12px ${fgColor}66, 0 0 28px ${fgColor}33`,
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}