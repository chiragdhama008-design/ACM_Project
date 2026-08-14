// Canvas Confetti and Card PNG Export Generator for PEC ACM

// 1. Pure JS Canvas Confetti Engine
export function triggerConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const colors = ["#0084FF", "#00F0FF", "#8B5CF6", "#EC4899", "#3B82F6", "#F59E0B", "#10B981"];
  const particles = [];
  const particleCount = 150;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: width / 2 + (Math.random() * 200 - 100),
      y: height / 2 - 100 + (Math.random() * 100 - 50),
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -18 - 4,
      size: Math.random() * 9 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      gravity: 0.35,
      drag: 0.98,
    });
  }

  let animationFrame;
  let startTime = Date.now();

  function render() {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, width, height);

    let activeParticles = 0;
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.rotation += p.rSpeed;

      if (elapsed > 2000) {
        p.opacity -= 0.02;
      }

      if (p.opacity > 0 && p.y < height + 50) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        // Draw glowing confetti rectangle or star
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        ctx.restore();
      }
    });

    if (activeParticles > 0 && elapsed < 4000) {
      animationFrame = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrame);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }
  }

  render();
}

// 2. High-Res Canvas Image Download Generator
export async function downloadCardAsImage(elementId, filename = "PEC_ACM_Persona_Card.png") {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("Card preview not found for export!");
    return;
  }

  try {
    // If html2canvas is dynamically available or fallback SVG foreignObject draw
    const canvas = document.createElement("canvas");
    const rect = element.getBoundingClientRect();
    const scale = 2; // High DPI

    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    // Create an inline SVG image representation of the card HTML
    const htmlString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, -apple-system, sans-serif; color: white;">
            ${element.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const svgBlob = new Blob([htmlString], { type: "image/svg+xml;charset=utf-8" });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(blobURL);

      // Convert canvas to PNG blob download
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.onerror = () => {
      // Fallback: simple printable window if SVG draw has cross-origin restrictions
      window.print();
    };
    img.src = blobURL;
  } catch (err) {
    console.error("Export error", err);
    window.print();
  }
}
