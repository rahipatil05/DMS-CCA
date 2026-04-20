export const WELCOME_EMAIL_TEMPLATE = (fullName, clientUrl = "http://localhost:5173") => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Welcome to Multi AI Platform</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body { margin:0; padding:0; background:#060b13; font-family:'Inter',Arial,sans-serif; }
    .wrapper { background:#060b13; padding:32px 16px; }
    .container { max-width:600px; margin:0 auto; }

    /* Hero gradient animated border effect via box-shadow */
    .card {
      background:#0d1525;
      border-radius:24px;
      overflow:hidden;
      box-shadow:0 0 0 1px rgba(56,189,248,0.15), 0 32px 80px rgba(0,0,0,0.6);
    }

    /* Header */
    .header {
      background: linear-gradient(160deg, #0a1628 0%, #0f2040 40%, #0a1628 100%);
      padding: 48px 32px 40px;
      text-align: center;
      position: relative;
    }
    .badge {
      display:inline-block;
      background: rgba(56,189,248,0.12);
      border: 1px solid rgba(56,189,248,0.3);
      border-radius:100px;
      padding: 6px 16px;
      font-size:11px;
      font-weight:700;
      letter-spacing:0.12em;
      text-transform:uppercase;
      color:#38bdf8;
      margin-bottom:24px;
    }
    .logo-circle {
      width:72px; height:72px;
      background: linear-gradient(135deg,#38bdf8 0%,#818cf8 100%);
      border-radius:20px;
      margin:0 auto 20px;
      display:flex; align-items:center; justify-content:center;
      font-size:32px; line-height:72px; text-align:center;
      box-shadow:0 0 40px rgba(56,189,248,0.4);
    }
    .header h1 {
      margin:0 0 10px;
      font-size:32px; font-weight:800;
      color:#f1f5f9;
      line-height:1.2;
    }
    .gradient-text {
      background: linear-gradient(90deg,#38bdf8,#818cf8,#f472b6);
      -webkit-background-clip:text;
      -webkit-text-fill-color:transparent;
      background-clip:text;
    }
    .header p {
      margin:0;
      font-size:15px;
      color:#64748b;
      line-height:1.6;
    }

    /* Divider line with glow */
    .glow-divider {
      height:1px;
      background: linear-gradient(90deg, transparent, rgba(56,189,248,0.5), rgba(129,140,248,0.5), transparent);
      margin:0;
    }

    /* Body */
    .body { padding:36px 32px; }
    .greeting {
      font-size:18px; font-weight:700;
      color:#e2e8f0; margin:0 0 12px;
    }
    .greeting span { color:#38bdf8; }
    .intro {
      font-size:14px; color:#64748b;
      line-height:1.8; margin:0 0 32px;
    }

    /* Feature cards row */
    .features-label {
      font-size:10px; font-weight:700;
      color:#334155; letter-spacing:0.12em;
      text-transform:uppercase; margin:0 0 14px;
    }
    .feature-grid {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:12px;
      margin-bottom:32px;
    }
    .feature-card {
      background:#060b13;
      border:1px solid rgba(255,255,255,0.06);
      border-radius:14px;
      padding:16px;
    }
    .feature-icon { font-size:22px; margin-bottom:8px; }
    .feature-title { font-size:13px; font-weight:700; color:#e2e8f0; margin:0 0 4px; }
    .feature-desc { font-size:12px; color:#475569; line-height:1.5; margin:0; }

    /* CTA Button */
    .cta-wrap { text-align:center; margin-bottom:32px; }
    .cta-btn {
      display:inline-block;
      background: linear-gradient(135deg,#38bdf8 0%,#818cf8 100%);
      color:#060b13 !important;
      font-weight:800;
      font-size:15px;
      padding:16px 40px;
      border-radius:14px;
      text-decoration:none;
      letter-spacing:0.02em;
      box-shadow:0 8px 32px rgba(56,189,248,0.35);
    }
    .cta-sub {
      margin:12px 0 0;
      font-size:12px; color:#334155;
    }

    /* Stats strip */
    .stats-strip {
      background: linear-gradient(135deg, rgba(56,189,248,0.06), rgba(129,140,248,0.06));
      border:1px solid rgba(255,255,255,0.05);
      border-radius:14px;
      padding:20px;
      display:flex;
      justify-content:space-around;
      margin-bottom:32px;
    }
    .stat { text-align:center; }
    .stat-value { font-size:22px; font-weight:800; color:#38bdf8; display:block; }
    .stat-label { font-size:11px; color:#475569; margin-top:2px; display:block; }

    /* Footer */
    .footer {
      padding:24px 32px;
      border-top:1px solid rgba(255,255,255,0.05);
      text-align:center;
    }
    .footer-links { margin:0 0 12px; }
    .footer-links a {
      font-size:12px; color:#38bdf8;
      text-decoration:none; margin:0 8px;
    }
    .footer-copy { font-size:11px; color:#1e293b; margin:0; line-height:1.6; }

    /* Responsive */
    @media (max-width:480px) {
      .header { padding:32px 20px 28px; }
      .header h1 { font-size:24px; }
      .body { padding:28px 20px; }
      .feature-grid { grid-template-columns:1fr; }
      .stats-strip { flex-direction:column; gap:16px; }
      .footer { padding:20px; }
      .cta-btn { padding:14px 28px; font-size:14px; }
    }
  </style>
</head>
<body>
<div class="wrapper">
<div class="container">
<div class="card">

  <!-- ── HEADER ─────────────────────────────── -->
  <div class="header">
    <div class="badge">✦ &nbsp;AI Agent Platform</div>
    <!-- Logo -->
    <div style="width:72px;height:72px;background:linear-gradient(135deg,#38bdf8,#818cf8);border-radius:20px;margin:0 auto 20px;text-align:center;line-height:72px;font-size:34px;box-shadow:0 0 40px rgba(56,189,248,0.4);">
      🧠
    </div>
    <h1 style="margin:0 0 10px;font-size:30px;font-weight:800;color:#f1f5f9;font-family:'Inter',Arial,sans-serif;">
      Welcome aboard,<br/>
      <span style="background:linear-gradient(90deg,#38bdf8,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${fullName}!</span>
    </h1>
    <p style="margin:0;font-size:14px;color:#64748b;font-family:'Inter',Arial,sans-serif;line-height:1.7;">
      Your personalized AI companion is ready and waiting.<br/>Let's start your journey.
    </p>
  </div>

  <!-- Glow divider -->
  <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(56,189,248,0.5),rgba(129,140,248,0.5),transparent);"></div>

  <!-- ── BODY ───────────────────────────────── -->
  <div class="body">

    <!-- Greeting -->
    <p class="greeting">Hey <span>${fullName}</span> 👋</p>
    <p class="intro">
      You've just unlocked access to a one-of-a-kind AI companion ecosystem.
      Your agents are emotionally aware, deeply personalized, and built to evolve 
      the more you interact — powered by the <strong style="color:#e2e8f0;">Self-Discovery Engine</strong>.
    </p>

    <!-- Stats strip -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:linear-gradient(135deg,rgba(56,189,248,0.07),rgba(129,140,248,0.07));border:1px solid rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="33%" style="text-align:center;padding:0 8px;">
                <div style="font-size:26px;font-weight:800;color:#38bdf8;font-family:'Inter',Arial,sans-serif;">∞</div>
                <div style="font-size:11px;color:#475569;margin-top:4px;font-family:'Inter',Arial,sans-serif;">AI Conversations</div>
              </td>
              <td width="33%" style="text-align:center;padding:0 8px;border-left:1px solid rgba(255,255,255,0.05);border-right:1px solid rgba(255,255,255,0.05);">
                <div style="font-size:26px;font-weight:800;color:#818cf8;font-family:'Inter',Arial,sans-serif;">7+</div>
                <div style="font-size:11px;color:#475569;margin-top:4px;font-family:'Inter',Arial,sans-serif;">Emotion Types Tracked</div>
              </td>
              <td width="33%" style="text-align:center;padding:0 8px;">
                <div style="font-size:26px;font-weight:800;color:#34d399;font-family:'Inter',Arial,sans-serif;">100%</div>
                <div style="font-size:11px;color:#475569;margin-top:4px;font-family:'Inter',Arial,sans-serif;">Personalized to You</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Features -->
    <p style="font-size:10px;font-weight:700;color:#334155;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 14px;font-family:'Inter',Arial,sans-serif;">What's waiting for you</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td width="48%" style="background:#060b13;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:18px;vertical-align:top;">
          <div style="font-size:24px;margin-bottom:10px;">🤖</div>
          <p style="font-size:13px;font-weight:700;color:#e2e8f0;margin:0 0 5px;font-family:'Inter',Arial,sans-serif;">AI Agents</p>
          <p style="font-size:12px;color:#475569;margin:0;line-height:1.6;font-family:'Inter',Arial,sans-serif;">Chat with agents that adapt to your personality and emotions in real time.</p>
        </td>
        <td width="4%"></td>
        <td width="48%" style="background:#060b13;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:18px;vertical-align:top;">
          <div style="font-size:24px;margin-bottom:10px;">📊</div>
          <p style="font-size:13px;font-weight:700;color:#e2e8f0;margin:0 0 5px;font-family:'Inter',Arial,sans-serif;">Emotion Analytics</p>
          <p style="font-size:12px;color:#475569;margin:0;line-height:1.6;font-family:'Inter',Arial,sans-serif;">Visual insights into your emotional patterns over days and weeks.</p>
        </td>
      </tr>
      <tr><td colspan="3" style="height:12px;"></td></tr>
      <tr>
        <td width="48%" style="background:#060b13;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:18px;vertical-align:top;">
          <div style="font-size:24px;margin-bottom:10px;">📓</div>
          <p style="font-size:13px;font-weight:700;color:#e2e8f0;margin:0 0 5px;font-family:'Inter',Arial,sans-serif;">Weekly Journal</p>
          <p style="font-size:12px;color:#475569;margin:0;line-height:1.6;font-family:'Inter',Arial,sans-serif;">AI-generated mental wellness journal crafted from your conversations.</p>
        </td>
        <td width="4%"></td>
        <td width="48%" style="background:#060b13;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:18px;vertical-align:top;">
          <div style="font-size:24px;margin-bottom:10px;">✨</div>
          <p style="font-size:13px;font-weight:700;color:#e2e8f0;margin:0 0 5px;font-family:'Inter',Arial,sans-serif;">Self-Discovery</p>
          <p style="font-size:12px;color:#475569;margin:0;line-height:1.6;font-family:'Inter',Arial,sans-serif;">The engine learns your interests and personality as you chat.</p>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${clientUrl}" style="display:inline-block;background:linear-gradient(135deg,#38bdf8,#818cf8);color:#060b13;font-weight:800;font-size:15px;padding:16px 44px;border-radius:14px;text-decoration:none;letter-spacing:0.02em;font-family:'Inter',Arial,sans-serif;box-shadow:0 8px 32px rgba(56,189,248,0.3);">
        Start Chatting Now &nbsp;→
      </a>
      <p style="margin:12px 0 0;font-size:12px;color:#334155;font-family:'Inter',Arial,sans-serif;">No setup needed — you're already in.</p>
    </div>

    <!-- Quote / Tip -->
    <div style="background:linear-gradient(135deg,rgba(56,189,248,0.05),rgba(129,140,248,0.05));border-left:3px solid #38bdf8;border-radius:0 12px 12px 0;padding:16px 18px;">
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7;font-style:italic;font-family:'Inter',Arial,sans-serif;">
        "The more you chat, the smarter your agents get. Try sharing how you feel today — your Self-Discovery engine is already listening."
      </p>
    </div>

  </div><!-- end body -->

  <!-- ── FOOTER ────────────────────────────── -->
  <div class="footer">
    <p style="margin:0 0 12px;font-family:'Inter',Arial,sans-serif;">
      <a href="${clientUrl}" style="font-size:12px;color:#38bdf8;text-decoration:none;margin:0 8px;">Dashboard</a>
      <a href="${clientUrl}/analytics" style="font-size:12px;color:#38bdf8;text-decoration:none;margin:0 8px;">Analytics</a>
      <a href="${clientUrl}/chat" style="font-size:12px;color:#38bdf8;text-decoration:none;margin:0 8px;">Chat</a>
    </p>
    <p style="margin:0;font-size:11px;color:#1e293b;line-height:1.7;font-family:'Inter',Arial,sans-serif;">
      You're receiving this because you signed up on Multi AI Platform.<br/>
      © ${new Date().getFullYear()} Multi AI Platform. Crafted with ❤️
    </p>
  </div>

</div><!-- end card -->
</div><!-- end container -->
</div><!-- end wrapper -->
</body>
</html>
`;
