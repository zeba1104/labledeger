import nodemailer from 'nodemailer';

let transporter = null;

// Initialize transporter
function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    try {
      if (host === 'smtp.gmail.com' || (user && user.includes('@gmail.com'))) {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass }
        });
        console.log('📧 Nodemailer configured with official Gmail Service for:', user);
      } else {
        transporter = nodemailer.createTransport({
          host: host || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: { user, pass },
          connectionTimeout: 8000,
        });
        console.log('📧 Nodemailer configured with live SMTP host:', host);
      }
    } catch (e) {
      console.warn('⚠️ SMTP creation failed, falling back to simulated transport:', e.message);
      transporter = nodemailer.createTransport({ jsonTransport: true });
    }
  } else {
    // Built-in simulated transport for local testing
    transporter = nodemailer.createTransport({ jsonTransport: true });
    console.log('ℹ️ Nodemailer running in instant simulated mode.');
  }

  return transporter;
}

export async function sendWelcomeCredentialsMail({ to, name, role, department, password, registeredBy }) {
  const portalUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const fromAddress = process.env.SMTP_FROM || '"LabLedger Biobank Systems" <noreply@labledger.org>';

  const roleDescriptions = {
    Researcher: 'Scientist privileges: Register & edit specimens, manage transfers, record experiment notes & assay findings, and print QR cryo-labels.',
    Technician: 'Laboratory Staff privileges: Scan QR barcodes, receive and store specimens, record storage transfers, and update aliquots & quantities.',
    Viewer: 'Compliance Auditor privileges: Read-only inspection of specimen registries, storage map coordinates, assay logs, and regulatory audit trail reports.',
    Admin: 'Principal Investigator privileges: Full administrative control, storage hierarchy builder, user role management, and transfer approvals.'
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.08); }
    .header { background: linear-gradient(135deg, #be123c, #e11d48, #9f1239); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #ffe4e6; }
    .content { padding: 32px 28px; }
    .role-badge { display: inline-block; padding: 4px 12px; background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; border-radius: 9999px; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 16px; }
    .credentials-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .cred-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
    .cred-row:last-child { border-bottom: none; }
    .cred-label { font-weight: 600; color: #64748b; }
    .cred-val { font-family: monospace; font-weight: 700; color: #0f172a; }
    .button { display: inline-block; background: #e11d48; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; margin-top: 12px; box-shadow: 0 4px 10px rgba(225, 29, 72, 0.3); }
    .footer { background: #f1f5f9; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔬 LabLedger Specimen Portal</h1>
      <p>Research Sample Tracking & Digital Logbook</p>
    </div>
    <div class="content">
      <span class="role-badge">Role Assigned: ${role}</span>
      <h2 style="margin: 0 0 12px; font-size: 18px; color: #0f172a;">Welcome to the Research Biobank, ${name}!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px;">
        An account has been created for you by <b>${registeredBy || 'Lab Director'}</b> in the <b>LabLedger</b> digital logbook. You now have authorized access to manage and review laboratory specimen coordinates, cold-chain transfers, and assay records.
      </p>

      <div class="credentials-box">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px;">Your Access Credentials</div>
        <div class="cred-row">
          <span class="cred-label">Portal URL:</span>
          <span class="cred-val">${portalUrl}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Login Email:</span>
          <span class="cred-val">${to}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Temporary Password:</span>
          <span class="cred-val" style="color: #be123c;">${password}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Assigned Role:</span>
          <span class="cred-val">${role}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Department:</span>
          <span class="cred-val">${department || 'General Laboratory'}</span>
        </div>
      </div>

      <div style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #881337; margin-bottom: 24px;">
        <b>Role Scope:</b> ${roleDescriptions[role] || roleDescriptions['Researcher']}
      </div>

      <div style="text-align: center;">
        <a href="${portalUrl}" class="button">Log In to LabLedger &rarr;</a>
      </div>
    </div>
    <div class="footer">
      LabLedger Biobank System &bull; ISO Class / GLP Compliant Forensic Sample Logbook<br>
      Automated system transmission. Please do not reply directly to this notification.
    </div>
  </div>
</body>
</html>
  `;

  try {
    const mailClient = getTransporter();
    const mailOptions = {
      from: fromAddress,
      to,
      subject: `🔬 Welcome to LabLedger — Your ${role} Access Credentials`,
      text: `Welcome to LabLedger, ${name}!\n\nYour account has been enrolled as ${role}.\nPortal: ${portalUrl}\nEmail: ${to}\nTemporary Password: ${password}\nDepartment: ${department}\n\nPlease sign in at ${portalUrl}.`,
      html: htmlContent,
    };

    const info = await mailClient.sendMail(mailOptions);
    console.log(`✉️ Onboarding email dispatched to ${to} for ${name} (${role})`);

    return {
      success: true,
      messageId: info.messageId || 'SIMULATED-' + Date.now(),
      recipient: to
    };
  } catch (err) {
    console.warn(`⚠️ Warning: Could not deliver email to ${to}:`, err.message);
    return {
      success: false,
      error: err.message,
      recipient: to
    };
  }
}
