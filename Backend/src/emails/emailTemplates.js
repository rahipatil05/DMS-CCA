export const WELCOME_EMAIL_TEMPLATE = (fullName, clientUrl) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to the Future | Multi AI</title>
</head>

<body
    style="margin: 0; padding: 0; background-color: #020817; font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
    <!-- Full Width Immersive Wrapper -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0"
        style="background-color: #020817; min-width: 100%; margin: 0 auto;">
        <tr>
            <td align="center">

                <!-- Main Content Container: 100% Width Experience -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0"
                    style="background: radial-gradient(circle at 50% 0%, #0f172a 0%, #020817 100%); width: 100%;">

                    <!-- Top Dynamic Bar -->
                    <tr>
                        <td height="6" style="background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);"></td>
                    </tr>

                    <!-- Branding Header -->
                    <tr>
                        <td style="padding: 40px 60px; text-align: center;">
                            <span
                                style="color: #60a5fa; font-weight: 800; font-size: 16px; letter-spacing: 0.15em; text-transform: uppercase;">Multi
                                personalized
                                AI Agent Platform</span>
                        </td>
                    </tr>

                    <!-- Hero Section: Full width centered layout -->
                    <tr>
                        <td style="padding: 60px 40px 40px 40px; text-align: center;">
                            <h1
                                style="color: #ffffff; font-size: 64px; font-weight: 900; line-height: 1; margin: 0 0 24px 0; letter-spacing: -0.05em;">
                                Welcome to our <br>
                                <span style="color: #60a5fa;">Universe.</span>
                            </h1>

                            <p
                                style="color: #94a3b8; font-size: 24px; line-height: 1.4; margin: 0 auto 40px auto; max-width: 650px;">
                                You're in. We've built the most advanced playground for AI agents, and you just got the
                                keys to the <span style="color: #ffffff; font-weight: 600;">Mainframe</span>.
                            </p>

                            <a href="${clientUrl}/dashboard"
                                style="display: inline-block; background: #ffffff; color: #020817; padding: 24px 64px; border-radius: 100px; font-weight: 900; font-size: 20px; text-decoration: none; box-shadow: 0 30px 60px rgba(59, 130, 246, 0.2); border: none;">
                                ENTER PLATFORM
                            </a>
                        </td>
                    </tr>

                    <!-- Full Width Visual Divider -->
                    <tr>
                        <td style="padding: 40px 60px;">
                            <div style="height: 1px; background: rgba(255,255,255,0.08); width: 100%;"></div>
                        </td>
                    </tr>

                    <!-- Feature Grid: 100% Width Centered Layout -->
                    <tr>
                        <td style="padding: 0 60px 80px 60px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <!-- Column 1 -->
                                    <td width="33%" valign="top" style="padding: 0 20px; text-align: center;">
                                        <div
                                            style="color: #3b82f6; font-size: 32px; font-weight: 900; margin-bottom: 12px;">
                                            01</div>
                                        <h3
                                            style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">
                                            Create.</h3>
                                        <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.6;">Spawn
                                            custom agents with personalities that match your exact vibe.</p>
                                    </td>
                                    <!-- Column 2 -->
                                    <td width="33%" valign="top" style="padding: 0 20px; text-align: center;">
                                        <div
                                            style="color: #8b5cf6; font-size: 32px; font-weight: 900; margin-bottom: 12px;">
                                            02</div>
                                        <h3
                                            style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">
                                            Chat.</h3>
                                        <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.6;">
                                            Seamless, ultra-low latency conversations with state-of-the-art models.</p>
                                    </td>
                                    <!-- Column 3 -->
                                    <td width="33%" valign="top" style="padding: 0 20px; text-align: center;">
                                        <div
                                            style="color: #ec4899; font-size: 32px; font-weight: 900; margin-bottom: 12px;">
                                            03</div>
                                        <h3
                                            style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">
                                            Evolve.</h3>
                                        <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.6;">Your
                                            workspace, your rules. The future is whatever you architect.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Minimal Footer -->
                    <tr>
                        <td align="center" style="padding: 60px; background: #000000;">
                            <p
                                style="color: #ffffff; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; margin: 0 0 12px 0;">
                                Multi AI Platform</p>
                            <p style="color: #475569; font-size: 12px; margin: 0;">
                                &copy; 2026 Multi AI Platform. Built for the bold.
                            </p>
                        </td>
                    </tr>

                </table>

                <!-- Spacer -->
                <div style="height: 100px;"></div>

            </td>
        </tr>
    </table>
</body>

</html>
`;
