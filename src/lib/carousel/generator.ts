/**
 * LUNVO 2.0 — High-Resolution PDF Carousel Generator
 * Generates 1080x1350 5-slide visual PDF carousels directly in browser/node
 * using lightweight jsPDF without native node dependencies.
 */

export type CarouselTemplateId = "minimal" | "bold" | "data" | "quote" | "checklist";

export interface CarouselSlide {
  title: string;
  body: string;
  template: CarouselTemplateId;
}

export function splitPostToSlides(postContent: string): CarouselSlide[] {
  const paragraphs = postContent
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  let chunks: string[] = [];
  if (paragraphs.length >= 5) {
    chunks = paragraphs.slice(0, 5);
  } else {
    const sentences = postContent.split(/(?<=[.!?])\s+/).filter(Boolean);
    const perSlide = Math.max(1, Math.ceil(sentences.length / 5));
    for (let i = 0; i < 5; i++) {
      chunks.push(
        sentences
          .slice(i * perSlide, (i + 1) * perSlide)
          .join(" ")
          .trim()
      );
    }
    chunks = chunks.filter(Boolean);
    while (chunks.length < 5) {
      chunks.push(paragraphs[paragraphs.length - 1] || "Follow for more insights.");
    }
  }

  const templates: CarouselTemplateId[] = ["minimal", "bold", "data", "quote", "checklist"];

  return chunks.slice(0, 5).map((body, idx) => ({
    title: idx === 0 ? chunks[0]?.split("\n")[0]?.slice(0, 60) || "Your Story" : `Slide ${idx + 1}`,
    body: body.slice(0, 280),
    template: templates[idx] || "minimal",
  }));
}

export async function generateCarouselPDF(postContent: string): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [1080, 1350],
  });

  const slides = splitPostToSlides(postContent);

  // Slide 1 — Minimal Cover
  {
    pdf.setFillColor(251, 250, 249);
    pdf.rect(0, 0, 1080, 1350, "F");
    pdf.setFillColor(0, 74, 198);
    pdf.rect(80, 120, 920, 12, "F");
    const title = slides[0]?.body.split("\n")[0]?.slice(0, 60) || "Your Story Matters";
    pdf.setFontSize(48);
    pdf.setTextColor("#1E1B16");
    pdf.setFont("helvetica", "bold");
    pdf.text(pdf.splitTextToSize(title, 900), 540, 280, { align: "center" });
    pdf.setFontSize(22);
    pdf.setTextColor("#64606E");
    pdf.setFont("helvetica", "normal");
    pdf.text(pdf.splitTextToSize(slides[0]?.body.slice(0, 300) || "", 850), 540, 520, {
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
      pdf.setFillColor(124, 58, 237);
      pdf.rect(0, 0, 24, 1350, "F");
      pdf.setFontSize(16);
      pdf.setTextColor("#7C3AED");
      pdf.text("INSIGHT", 80, 80);
      pdf.setFontSize(28);
      pdf.setTextColor("#1E1B16");
      pdf.setFont("helvetica", "bold");
      pdf.text(pdf.splitTextToSize(slides[idx]?.body || "", 900), 80, 160);
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
      pdf.text(pdf.splitTextToSize(slides[idx]?.body.slice(0, 140) || "", 880), 100, 160);
      pdf.setFontSize(18);
      pdf.setTextColor("#64606E");
      pdf.text(pdf.splitTextToSize(slides[idx]?.body.slice(140, 400) || "", 960), 60, 520);
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
      pdf.text(pdf.splitTextToSize(slides[idx]?.body || "", 920), 80, 320);
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
      const points = (slides[idx]?.body || "")
        .split(/[.••\n]/)
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 3);
      const bullets =
        points.length >= 2
          ? points
          : [
              slides[idx]?.body.slice(0, 90) || "",
              slides[idx]?.body.slice(90, 180) || "",
              "Follow for more",
            ];
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

export function getCarouselSlideCount(): number {
  return 5;
}
