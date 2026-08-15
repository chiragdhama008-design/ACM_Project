// Canvas Confetti and Bulletproof HD Card PNG Exporter with Official PEC ACM Team Data

import { ACM_HEADS, ACM_LEADS } from "../data/teamData";

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

  const colors = ["#00F0FF", "#7000FF", "#FF007A", "#0084FF", "#F59E0B", "#10B981", "#38BDF8"];
  const particles = [];
  const particleCount = 160;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: width / 2 + (Math.random() * 240 - 120),
      y: height / 2 - 100 + (Math.random() * 100 - 50),
      vx: (Math.random() - 0.5) * 18,
      vy: Math.random() * -20 - 4,
      size: Math.random() * 9 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 14,
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

// 2. Direct High-Definition 2D Canvas Exporter with ACM Chapter Team Data
export function downloadCardAsImage(elementId, filename = "PEC_ACM_Persona_Scorecard.png", personaData = null) {
  const canvas = document.createElement("canvas");
  const width = 640;
  const height = 940;
  canvas.width = width * 2; // High DPI (2x resolution for ultra-crisp print quality)
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);

  // Background Dark Cyber Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#030718");
  bgGrad.addColorStop(0.4, "#061138");
  bgGrad.addColorStop(0.8, "#090d2a");
  bgGrad.addColorStop(1, "#020410");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Vibrant Radiant Border Glow
  const borderGrad = ctx.createLinearGradient(0, 0, width, height);
  borderGrad.addColorStop(0, "#00F0FF");
  borderGrad.addColorStop(0.5, "#7000FF");
  borderGrad.addColorStop(1, "#FF007A");
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 3.5;
  ctx.shadowColor = "#00F0FF";
  ctx.shadowBlur = 14;
  ctx.strokeRect(12, 12, width - 24, height - 24);
  ctx.shadowBlur = 0; // Reset shadow

  // Inner Accent Frame
  ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  // Top Chapter Header
  ctx.fillStyle = "#00F0FF";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("PEC ACM STUDENT CHAPTER • COMPUTING STUDENT SOCIETY", 38, 50);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px system-ui, -apple-system, sans-serif";
  ctx.fillText(`Punjab Engineering College (PEC Chandigarh) • Session 2026-27`, 38, 68);

  // Divider Line
  const divGrad = ctx.createLinearGradient(38, 78, width - 38, 78);
  divGrad.addColorStop(0, "#00F0FF");
  divGrad.addColorStop(0.5, "#7000FF");
  divGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = divGrad;
  ctx.beginPath();
  ctx.moveTo(38, 80);
  ctx.lineTo(width - 38, 80);
  ctx.stroke();

  // Candidate Name & Branch
  const candidateName = personaData?.name || "PEC Student";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
  ctx.fillText(candidateName, 38, 118);

  const branchText = personaData?.branch || "Engineering";
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
  ctx.fillText(`🎓 ${branchText}  •  ${personaData?.timestamp || new Date().toLocaleDateString()}`, 38, 140);

  // 👑 Persona Title Box
  const titleBoxY = 160;
  const titleBoxGrad = ctx.createLinearGradient(38, titleBoxY, width - 38, titleBoxY + 80);
  titleBoxGrad.addColorStop(0, "#0d2260");
  titleBoxGrad.addColorStop(1, "#280b54");
  ctx.fillStyle = titleBoxGrad;
  ctx.beginPath();
  ctx.roundRect(38, titleBoxY, width - 76, 78, 14);
  ctx.fill();
  ctx.strokeStyle = "#00F0FF";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#F59E0B";
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  ctx.fillText("👑 OFFICIAL ACM PERSONA TITLE", 54, titleBoxY + 24);

  const personaTitle = personaData?.personaTitle || "Full-Stack Systems Architect";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
  ctx.fillText(`"${personaTitle}"`, 54, titleBoxY + 54);

  // 🎯 Recommended Wing Box
  const wingBoxY = 252;
  ctx.fillStyle = "#07173b";
  ctx.beginPath();
  ctx.roundRect(38, wingBoxY, width - 76, 85, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#00F0FF";
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  ctx.fillText("🎯 RECOMMENDED ACM WING", 54, wingBoxY + 24);

  const wingName = personaData?.recommendedWing || "ACM-Dev";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
  ctx.fillText(`Wing: ${wingName}`, width - 170, wingBoxY + 24);

  const wingDesc = personaData?.wingDescription || "Practical problem solver built for PEC Chandigarh tech ecosystem!";
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "11px system-ui, -apple-system, sans-serif";
  
  // Wrap text cleanly
  const words = wingDesc.split(" ");
  let line = "";
  let lineY = wingBoxY + 48;
  words.forEach(w => {
    if (ctx.measureText(line + w).width > width - 110) {
      ctx.fillText(line, 54, lineY);
      line = w + " ";
      lineY += 16;
    } else {
      line += w + " ";
    }
  });
  ctx.fillText(line, 54, lineY);

  // 📊 Metrics Section
  const metricsY = 350;
  ctx.fillStyle = "#040b20";
  ctx.beginPath();
  ctx.roundRect(38, metricsY, width - 76, 175, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  ctx.fillText("APTITUDE EVALUATION BREAKDOWN", 54, metricsY + 24);

  const drawBar = (label, score, y, color) => {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
    ctx.fillText(label, 54, y);
    ctx.fillText(`${score}%`, width - 90, y);

    // Bar Background
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(54, y + 6, width - 144, 9, 4);
    ctx.fill();

    // Fill Progress
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(54, y + 6, (width - 144) * (Math.max(0, Math.min(100, score)) / 100), 9, 4);
    ctx.fill();
  };

  drawBar("CP Logic & Optimization", personaData?.cpScore ?? 80, metricsY + 50, "#3b82f6");
  drawBar("AI & Machine Intelligence", personaData?.aiScore ?? 85, metricsY + 95, "#a855f7");
  drawBar("Full-Stack Dev & Architecture", personaData?.devScore ?? 88, metricsY + 140, "#00F0FF");

  // 🌟 OFFICIAL PEC ACM CHAPTER TEAM DATA SECTION
  const teamBoxY = 538;
  ctx.fillStyle = "#061230";
  ctx.beginPath();
  ctx.roundRect(38, teamBoxY, width - 76, 270, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(59, 130, 246, 0.35)";
  ctx.stroke();

  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("OFFICIAL PEC ACM CHAPTER LEADERSHIP & MENTORSHIP TEAM", 54, teamBoxY + 25);

  // Executive Heads
  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  ctx.fillText("EXECUTIVE BOARD (2026-27):", 54, teamBoxY + 48);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "10px system-ui, -apple-system, sans-serif";
  ctx.fillText("• Vidhi Sethi (Secretary)  •  Bhavik Vishal Sharma (Joint Secretary)", 54, teamBoxY + 68);
  ctx.fillText("• Aayush Sharma (Asst. Secretary)  •  Himanshi Garg (Treasurer)", 54, teamBoxY + 86);
  ctx.fillText("• Harmanjeet Singh Sahota (Webmaster)", 54, teamBoxY + 104);

  // Domain Leads
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.moveTo(54, teamBoxY + 118);
  ctx.lineTo(width - 54, teamBoxY + 118);
  ctx.stroke();

  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  ctx.fillText("DOMAIN LEADS & WING MENTORS:", 54, teamBoxY + 138);

  ctx.fillStyle = "#93c5fd";
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  ctx.fillText("CP Wing Leads:", 54, teamBoxY + 158);
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "10px system-ui, -apple-system, sans-serif";
  ctx.fillText("Sachin, Dheeraj Kumar", 150, teamBoxY + 158);

  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  ctx.fillText("AI/ML Wing Leads:", 54, teamBoxY + 178);
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "10px system-ui, -apple-system, sans-serif";
  ctx.fillText("Abhipsit Bajpai, Amisha Gupta, Mithas Janbade", 160, teamBoxY + 178);

  ctx.fillStyle = "#22d3ee";
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  ctx.fillText("Dev Wing Leads:", 54, teamBoxY + 198);
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "10px system-ui, -apple-system, sans-serif";
  ctx.fillText("Pranav Bhatia, Kanavpreet Singh, Ananyaa Priyadarshini", 150, teamBoxY + 198);

  ctx.fillStyle = "#f472b6";
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  ctx.fillText("Other Leads:", 54, teamBoxY + 218);
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "10px system-ui, -apple-system, sans-serif";
  ctx.fillText("Yatin (Branding), Anav (Alumni), Mihira (Ops), Rishuraj (Marketing), Diya (WiT), Madhav (Cyber)", 135, teamBoxY + 218);

  // Quote
  ctx.fillStyle = "#64748b";
  ctx.font = "italic 9.5px system-ui, -apple-system, sans-serif";
  ctx.fillText("ACM Membership & Wing Allocation is based on technical curiosity, problem-solving, and collaboration.", 54, teamBoxY + 248);

  // Footer Verification Watermark
  ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
  ctx.beginPath();
  ctx.moveTo(38, 825);
  ctx.lineTo(width - 38, 825);
  ctx.stroke();

  ctx.fillStyle = "#00F0FF";
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  ctx.fillText("✓ Verified by PEC ACM Student Chapter Evaluation Engine", 38, 850);

  ctx.fillStyle = "#64748b";
  ctx.font = "mono 10px monospace";
  ctx.fillText(`VERIFICATION ID: ACM-PEC-${Math.floor(100000 + Math.random() * 900000)}`, width - 260, 850);

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

