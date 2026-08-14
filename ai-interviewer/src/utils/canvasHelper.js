// Canvas Confetti and Bulletproof HD Card PNG Exporter for PEC ACM

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

// 2. Direct High-Definition 2D Canvas Exporter (Works 100% reliably on all browsers)
export function downloadCardAsImage(elementId, filename = "PEC_ACM_Persona_Card.png", personaData = null) {
  const canvas = document.createElement("canvas");
  const width = 600;
  const height = 820;
  canvas.width = width * 2; // High DPI (2x resolution)
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);

  // Background Dark Cyber Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#050b1e");
  bgGrad.addColorStop(0.5, "#081233");
  bgGrad.addColorStop(1, "#040816");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Border Glow
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#1d4ed8";
  ctx.shadowBlur = 12;
  ctx.strokeRect(12, 12, width - 24, height - 24);
  ctx.shadowBlur = 0; // Reset shadow

  // Inner Border Accent
  ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Header Brand
  ctx.fillStyle = "#93c5fd";
  ctx.font = "bold 13px system-ui, sans-serif";
  ctx.fillText("PEC ACM STUDENT CHAPTER • COMPUTING STUDENT SOCIETY", 40, 55);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px system-ui, sans-serif";
  ctx.fillText(`PEC Chandigarh • ${personaData?.timestamp || new Date().toLocaleDateString()}`, 40, 75);

  // Horizontal Divider Line
  ctx.strokeStyle = "rgba(0, 132, 255, 0.3)";
  ctx.beginPath();
  ctx.moveTo(40, 90);
  ctx.lineTo(width - 40, 90);
  ctx.stroke();

  // Candidate Name
  const candidateName = personaData?.name || "PEC Student";
  ctx.fillStyle = "#ffffff";
  ctx.font = "black 28px system-ui, sans-serif";
  ctx.fillText(candidateName, 40, 130);

  // Branch & Status
  const branchText = personaData?.branch || "Engineering";
  ctx.fillStyle = "#00F0FF";
  ctx.font = "bold 13px system-ui, sans-serif";
  ctx.fillText(`🎓 ${branchText}`, 40, 155);

  // 👑 Persona Title Box
  const titleBoxY = 180;
  const titleBoxGrad = ctx.createLinearGradient(40, titleBoxY, width - 40, titleBoxY + 85);
  titleBoxGrad.addColorStop(0, "#091c4d");
  titleBoxGrad.addColorStop(1, "#1e0b4d");
  ctx.fillStyle = titleBoxGrad;
  ctx.beginPath();
  ctx.roundRect(40, titleBoxY, width - 80, 85, 16);
  ctx.fill();
  ctx.strokeStyle = "#00F0FF";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#F59E0B";
  ctx.font = "bold 11px system-ui, sans-serif";
  ctx.fillText("👑 AI EVALUATED PERSONA TITLE", 58, titleBoxY + 28);

  const personaTitle = personaData?.personaTitle || "The Tech Pioneer";
  ctx.fillStyle = "#ffffff";
  ctx.font = "black 22px system-ui, sans-serif";
  ctx.fillText(`"${personaTitle}"`, 58, titleBoxY + 60);

  // 🎯 Recommended Wing Box
  const wingBoxY = 285;
  ctx.fillStyle = "#09173d";
  ctx.beginPath();
  ctx.roundRect(40, wingBoxY, width - 80, 95, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#00F0FF";
  ctx.font = "bold 11px system-ui, sans-serif";
  ctx.fillText("🎯 RECOMMENDED PEC ACM WING", 58, wingBoxY + 26);

  const wingName = personaData?.recommendedWing || "ACM-Dev";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px system-ui, sans-serif";
  ctx.fillText(`Wing: ${wingName}`, width - 180, wingBoxY + 26);

  const wingDesc = personaData?.wingDescription || "Pragmatic problem solver built for PEC tech ecosystem!";
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "12px system-ui, sans-serif";
  
  // Wrap text cleanly
  const words = wingDesc.split(" ");
  let line = "";
  let lineY = wingBoxY + 54;
  words.forEach(w => {
    if (ctx.measureText(line + w).width > width - 120) {
      ctx.fillText(line, 58, lineY);
      line = w + " ";
      lineY += 18;
    } else {
      line += w + " ";
    }
  });
  ctx.fillText(line, 58, lineY);

  // 📊 Metrics Section
  const metricsY = 400;
  ctx.fillStyle = "#030818";
  ctx.beginPath();
  ctx.roundRect(40, metricsY, width - 80, 190, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 11px system-ui, sans-serif";
  ctx.fillText("PEC TECH & SURVIVAL METRICS", 58, metricsY + 28);

  const drawBar = (label, score, y, color) => {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.fillText(label, 58, y);
    ctx.fillText(`${score}%`, width - 90, y);

    // Bar Background
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(58, y + 8, width - 148, 10, 5);
    ctx.fill();

    // Fill Progress
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(58, y + 8, (width - 148) * (score / 100), 10, 5);
    ctx.fill();
  };

  drawBar("CP Logic & Speed", personaData?.cpScore || 85, metricsY + 55, "#3b82f6");
  drawBar("AI Innovation", personaData?.aiScore || 88, metricsY + 105, "#a855f7");
  drawBar("Dev Execution", personaData?.devScore || 90, metricsY + 155, "#00F0FF");

  // AI Quotes
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "italic 11px system-ui, sans-serif";
  const lockQuote = personaData?.lockComment || "Escaping attendance emergencies with top-tier PEC survival instinct!";
  ctx.fillText(`💬 "${lockQuote.substring(0, 75)}..."`, 40, 620);

  const robotQuote = personaData?.robotComment || "Automating campus life proves you belong in PEC ACM!";
  ctx.fillText(`🤖 "${robotQuote.substring(0, 75)}..."`, 40, 645);

  // Footer Verification Watermark
  ctx.strokeStyle = "rgba(0, 132, 255, 0.3)";
  ctx.beginPath();
  ctx.moveTo(40, 670);
  ctx.lineTo(width - 40, 670);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = "10px system-ui, sans-serif";
  ctx.fillText("Verified by PEC ACM - CSS AI Engine", 40, 695);
  ctx.fillText(`ID: ACM-${Math.floor(100000 + Math.random() * 900000)}`, width - 160, 695);

  // Convert canvas to PNG blob download
  try {
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (err) {
    console.error("Canvas export error", err);
    window.print();
  }
}
