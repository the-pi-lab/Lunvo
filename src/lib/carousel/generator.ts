/**
 * Phase 28 — Carousel Generator (Moat #1)
 * 1080x1350 PDF, 5 templates, pptxgenjs
 * Generates a 5-slide carousel from a LinkedIn post
 */

export type CarouselTemplateId = "minimal" | "bold" | "data" | "quote" | "checklist";

export interface CarouselSlide {
  title: string;
  body: string;
  template: CarouselTemplateId;
}

function splitPostToSlides(postContent: string): CarouselSlide[] {
  const paragraphs = postContent
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // If we have 5+ paragraphs, take first 5
  // If fewer, split by sentences
  let chunks: string[] = [];
  if (paragraphs.length >= 5) {
    chunks = paragraphs.slice(0, 5);
  } else {
    // Split by sentences
    const sentences = postContent.split(/(?<=[.!?])\s+/).filter(Boolean);
    const perSlide = Math.ceil(sentences.length / 5);
    for (let i = 0; i < 5; i++) {
      chunks.push(
        sentences
          .slice(i * perSlide, (i + 1) * perSlide)
          .join(" ")
          .trim()
      );
    }
    chunks = chunks.filter(Boolean);
    // Pad if needed
    while (chunks.length < 5) {
      chunks.push(paragraphs[paragraphs.length - 1] || "Follow for more insights.");
    }
  }

  // Assign templates
  const templates: CarouselTemplateId[] = ["minimal", "bold", "data", "quote", "checklist"];

  return chunks.slice(0, 5).map((body, idx) => ({
    title: idx === 0 ? chunks[0]!.split("\n")[0]!.slice(0, 60) : `Slide ${idx + 1}`,
    body: body.slice(0, 280),
    template: templates[idx]!,
  }));
}

function addMinimalSlide(slide: any, title: string, body: string) {
  // Cover - centered, large
  slide.background = { color: "FBFAF9" };
  // Accent bar
  slide.addShape("rect", { x: 0.5, y: 0.8, w: 6.5, h: 0.08, fill: { color: "004AC6" } });
  slide.addText(title, {
    x: 0.5,
    y: 1.5,
    w: 6.5,
    h: 1.5,
    fontSize: 28,
    fontFace: "Newsreader",
    color: "1E1B16",
    bold: true,
    align: "center",
    valign: "middle",
  });
  slide.addText(body, {
    x: 0.8,
    y: 3.5,
    w: 5.9,
    h: 4.5,
    fontSize: 14,
    fontFace: "Plus Jakarta Sans",
    color: "64606E",
    align: "center",
    valign: "top",
    lineSpacingMultiple: 1.2,
  });
  slide.addText("LUNVO • Carousel", {
    x: 0.5,
    y: 8.7,
    w: 6.5,
    h: 0.3,
    fontSize: 8,
    fontFace: "JetBrains Mono",
    color: "A8A6B0",
    align: "center",
  });
}

function addBoldSlide(slide: any, body: string) {
  slide.background = { color: "FFFFFF" };
  // Left accent
  slide.addShape("rect", { x: 0, y: 0, w: 0.3, h: 9.375, fill: { color: "7C3AED" } });
  slide.addText("INSIGHT", {
    x: 0.6,
    y: 0.6,
    w: 2,
    h: 0.4,
    fontSize: 10,
    fontFace: "JetBrains Mono",
    color: "7C3AED",
    bold: true,
  });
  slide.addText(body, {
    x: 0.6,
    y: 1.2,
    w: 6.3,
    h: 7,
    fontSize: 18,
    fontFace: "Plus Jakarta Sans",
    color: "1E1B16",
    bold: true,
    align: "left",
    valign: "top",
    lineSpacingMultiple: 1.15,
  });
}

function addDataSlide(slide: any, body: string) {
  slide.background = { color: "F3F1F7" };
  // Number card
  slide.addShape("roundRect", {
    x: 0.5,
    y: 0.5,
    w: 6.5,
    h: 2.5,
    rectRadius: 0.2,
    fill: { color: "FFFFFF" },
    line: { color: "E5E2DA", width: 1 },
    shadow: { type: "outer", blur: 6, offset: 2, angle: 90, color: "000000", opacity: 0.06 },
  });
  slide.addText("DATA POINT", {
    x: 0.8,
    y: 0.7,
    w: 2,
    h: 0.3,
    fontSize: 9,
    fontFace: "JetBrains Mono",
    color: "059669",
    bold: true,
  });
  slide.addText(body.slice(0, 120), {
    x: 0.8,
    y: 1.1,
    w: 5.9,
    h: 1.6,
    fontSize: 13,
    fontFace: "Plus Jakarta Sans",
    color: "1E1B16",
    align: "left",
  });
  // Secondary body
  slide.addText(body.slice(120), {
    x: 0.5,
    y: 3.5,
    w: 6.5,
    h: 5,
    fontSize: 12,
    fontFace: "Plus Jakarta Sans",
    color: "64606E",
    align: "left",
    lineSpacingMultiple: 1.2,
  });
}

function addQuoteSlide(slide: any, body: string) {
  slide.background = { color: "1E1B16" };
  slide.addText("“", {
    x: 0.5,
    y: 0.8,
    w: 1,
    h: 1,
    fontSize: 60,
    fontFace: "Newsreader",
    color: "7C3AED",
    align: "left",
  });
  slide.addText(body, {
    x: 0.8,
    y: 2,
    w: 5.9,
    h: 5,
    fontSize: 20,
    fontFace: "Newsreader",
    color: "FFFFFF",
    italic: true,
    align: "left",
    valign: "top",
    lineSpacingMultiple: 1.25,
  });
  slide.addShape("rect", { x: 0.8, y: 7.5, w: 1.5, h: 0.06, fill: { color: "FFFFFF" } });
  slide.addText("— LUNVO Studio", {
    x: 0.8,
    y: 7.8,
    w: 3,
    h: 0.3,
    fontSize: 9,
    fontFace: "JetBrains Mono",
    color: "A8A6B0",
  });
}

function addChecklistSlide(slide: any, body: string) {
  slide.background = { color: "FFFFFF" };
  slide.addText("YOUR NEXT STEPS", {
    x: 0.5,
    y: 0.6,
    w: 6.5,
    h: 0.4,
    fontSize: 10,
    fontFace: "JetBrains Mono",
    color: "004AC6",
    bold: true,
    align: "center",
  });
  // Split body into bullet points
  const points = body
    .split(/[.••\n]/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 3);
  const bullets =
    points.length >= 2 ? points : [body.slice(0, 90), body.slice(90, 180), "Follow for more"];

  bullets.forEach((point, idx) => {
    const y = 1.5 + idx * 1.8;
    slide.addShape("ellipse", { x: 0.8, y: y + 0.1, w: 0.35, h: 0.35, fill: { color: "004AC6" } });
    slide.addText("✓", {
      x: 0.8,
      y: y + 0.05,
      w: 0.35,
      h: 0.35,
      fontSize: 10,
      color: "FFFFFF",
      align: "center",
      valign: "middle",
    });
    slide.addText(point, {
      x: 1.3,
      y: y,
      w: 5.4,
      h: 1.4,
      fontSize: 12,
      fontFace: "Plus Jakarta Sans",
      color: "1E1B16",
      align: "left",
      valign: "top",
    });
  });

  // CTA button
  slide.addShape("roundRect", {
    x: 2,
    y: 7.5,
    w: 3.5,
    h: 0.7,
    rectRadius: 0.3,
    fill: { color: "004AC6" },
  });
  slide.addText("Follow for more →", {
    x: 2,
    y: 7.5,
    w: 3.5,
    h: 0.7,
    fontSize: 11,
    fontFace: "Plus Jakarta Sans",
    color: "FFFFFF",
    bold: true,
    align: "center",
    valign: "middle",
  });
}

export async function generateCarouselPDF(postContent: string): Promise<Blob> {
  // Use jsPDF for PDF (browser-friendly, no node: deps)
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [1080, 1350],
  });

  const slides = splitPostToSlides(postContent);

  // Helper to add centered text with wrapping
  const addCentered = (
    doc: typeof pdf,
    text: string,
    y: number,
    opts: { size: number; color: string; bold?: boolean }
  ) => {
    doc.setFontSize(opts.size);
    doc.setTextColor(opts.color);
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, 900);
    const x = 540 - doc.getTextWidth(lines[0] || "") / 2;
    // jsPDF text with align center
    doc.text(lines, 540, y, { align: "center", maxWidth: 900 });
  };

  // Slide 1 — Minimal Cover
  {
    pdf.setFillColor(251, 250, 249); // #FBFAF9
    pdf.rect(0, 0, 1080, 1350, "F");
    // accent bar
    pdf.setFillColor(0, 74, 198); // #004AC6
    pdf.rect(80, 120, 920, 12, "F");
    const title = slides[0]!.body.split("\n")[0]!.slice(0, 60) || "Your Story Matters";
    pdf.setFontSize(48);
    pdf.setTextColor("#1E1B16");
    pdf.setFont("helvetica", "bold");
    pdf.text(pdf.splitTextToSize(title, 900), 540, 280, { align: "center" });
    pdf.setFontSize(22);
    pdf.setTextColor("#64606E");
    pdf.setFont("helvetica", "normal");
    pdf.text(pdf.splitTextToSize(slides[0]!.body.slice(0, 300), 850), 540, 520, {
      align: "center",
    });
    pdf.setFontSize(14);
    pdf.setTextColor("#A8A6B0");
    pdf.text("LUNVO • Carousel", 540, 1250, { align: "center" });
  }

  // Slides 2-5
  const templates: Array<(idx: number) => void> = [
    // Slide 2 — Bold
    (idx) => {
      pdf.addPage([1080, 1350], "portrait");
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 1080, 1350, "F");
      pdf.setFillColor(124, 58, 237); // #7C3AED
      pdf.rect(0, 0, 24, 1350, "F");
      pdf.setFontSize(16);
      pdf.setTextColor("#7C3AED");
      pdf.text("INSIGHT", 80, 80);
      pdf.setFontSize(28);
      pdf.setTextColor("#1E1B16");
      pdf.setFont("helvetica", "bold");
      pdf.text(pdf.splitTextToSize(slides[idx]!.body, 900), 80, 160);
    },
    // Slide 3 — Data
    (idx) => {
      pdf.addPage([1080, 1350], "portrait");
      pdf.setFillColor(243, 241, 247);
      pdf.rect(0, 0, 1080, 1350, "F");
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(60, 60, 960, 320, 16, 16, "F");
      pdf.setDrawColor(229, 226, 218);
      pdf.roundedRect(60, 60, 960, 320, 16, 16, "D");
      pdf.setFontSize(14);
      pdf.setTextColor("#059669");
      pdf.text("DATA POINT", 100, 110);
      pdf.setFontSize(20);
      pdf.setTextColor("#1E1B16");
      pdf.text(pdf.splitTextToSize(slides[idx]!.body.slice(0, 140), 880), 100, 160);
      pdf.setFontSize(18);
      pdf.setTextColor("#64606E");
      pdf.text(pdf.splitTextToSize(slides[idx]!.body.slice(140, 400), 960), 60, 520);
    },
    // Slide 4 — Quote (dark)
    (idx) => {
      pdf.addPage([1080, 1350], "portrait");
      pdf.setFillColor(30, 27, 22);
      pdf.rect(0, 0, 1080, 1350, "F");
      pdf.setFontSize(80);
      pdf.setTextColor("#7C3AED");
      pdf.text("“", 80, 180);
      pdf.setFontSize(28);
      pdf.setTextColor("#FFFFFF");
      pdf.setFont("helvetica", "italic");
      pdf.text(pdf.splitTextToSize(slides[idx]!.body, 920), 80, 320);
      pdf.setFillColor(255, 255, 255);
      pdf.rect(80, 1050, 200, 4, "F");
      pdf.setFontSize(16);
      pdf.setTextColor("#A8A6B0");
      pdf.text("— LUNVO Studio", 80, 1100);
    },
    // Slide 5 — Checklist CTA
    (idx) => {
      pdf.addPage([1080, 1350], "portrait");
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 1080, 1350, "F");
      pdf.setFontSize(16);
      pdf.setTextColor("#004AC6");
      pdf.setFont("helvetica", "bold");
      pdf.text("YOUR NEXT STEPS", 540, 80, { align: "center" });
      const points = slides[idx]!.body.split(/[.••\n]/)
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 3);
      const bullets =
        points.length >= 2
          ? points
          : [slides[idx]!.body.slice(0, 90), slides[idx]!.body.slice(90, 180), "Follow for more"];
      bullets.forEach((point, pIdx) => {
        const y = 220 + pIdx * 220;
        pdf.setFillColor(0, 74, 198);
        pdf.circle(120, y, 18, "F");
        pdf.setFontSize(16);
        pdf.setTextColor("#FFFFFF");
        pdf.text("✓", 120, y + 6, { align: "center" });
        pdf.setFontSize(18);
        pdf.setTextColor("#1E1B16");
        pdf.text(pdf.splitTextToSize(point, 800), 160, y);
      });
      // CTA button
      pdf.setFillColor(0, 74, 198);
      pdf.roundedRect(340, 1050, 400, 70, 20, 20, "F");
      pdf.setFontSize(18);
      pdf.setTextColor("#FFFFFF");
      pdf.setFont("helvetica", "bold");
      pdf.text("Follow for more →", 540, 1095, { align: "center" });
    },
  ];

  // Add slides 2-5 (index 1-4)
  templates.forEach((fn, i) => fn(i + 1));

  return pdf.output("blob") as Blob;
}

export async function downloadCarouselPDF(
  postContent: string,
  filename = "lunvo-carousel.pdf"
): Promise<void> {
  const blob = await generateCarouselPDF(postContent);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// For testing: get slide count without generating file
export function getCarouselSlideCount(): number {
  return 5;
}
