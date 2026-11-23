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
  const fromAddress = process.env.SMTP_FROM || '"LabLedger Biobank Systems" <noreply@yopmail.com>';

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

export async function sendExpiryAlertMail({ to, ownerName, expiringSamples, daysThreshold = 7 }) {
  const portalUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const fromAddress = process.env.SMTP_FROM || '"LabLedger Biobank Systems" <alerts@yopmail.com>';

  const samplesListRows = expiringSamples.map(s => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 12px 8px; font-weight: 700; color: #be123c; font-family: monospace;">${s.sampleId}</td>
      <td style="padding: 12px 8px; font-weight: 600; color: #1e293b;">
        ${s.name}
        <div style="font-size: 11px; color: #64748b; font-weight: normal;">${s.type} &bull; ${s.quantity || ''} ${s.unit || ''}</div>
      </td>
      <td style="padding: 12px 8px; font-size: 12px; color: #475569;">${s.storagePath || 'Unassigned'}</td>
      <td style="padding: 12px 8px; font-size: 12px; font-family: monospace; white-space: nowrap;">
        ${s.expiryDate ? new Date(s.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
      </td>
      <td style="padding: 12px 8px; text-align: center;">
        <span style="display: inline-block; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; ${
          s.daysRemaining <= 0
            ? 'background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;'
            : s.daysRemaining <= 3
            ? 'background: #fff1f2; color: #be123c; border: 1px solid #fecdd3;'
            : 'background: #fffbeb; color: #b45309; border: 1px solid #fde68a;'
        }">
          ${s.daysRemaining <= 0 ? 'EXPIRED' : `${s.daysRemaining}d left`}
        </span>
      </td>
    </tr>
  `).join('');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(190, 18, 60, 0.08); }
    .header { background: linear-gradient(135deg, #b91c1c, #dc2626, #991b1b); padding: 30px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #fee2e2; }
    .content { padding: 28px 24px; }
    .alert-banner { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 14px 18px; margin-bottom: 22px; font-size: 13px; color: #9f1239; line-height: 1.5; }
    .specimen-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px; }
    .specimen-table th { background: #f8fafc; padding: 10px 8px; text-align: left; font-weight: 700; color: #64748b; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .button { display: inline-block; background: #dc2626; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 13px; text-align: center; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.25); }
    .footer { background: #f8fafc; padding: 16px 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ LabLedger Storage & Expiry Warning</h1>
      <p>Automated Cold-Chain & Reagent Viability Surveillance</p>
    </div>
    <div class="content">
      <div class="alert-banner">
        <strong>Action Recommended:</strong> You have <strong>${expiringSamples.length} specimen(s)</strong> approaching their maximum storage duration or expiration date within the next <strong>${daysThreshold} days</strong>.
      </div>
      <p style="font-size: 14px; margin: 0 0 16px; color: #334155;">
        Dear <b>${ownerName || 'Laboratory Scientist'}</b>,
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0 0 20px;">
        In accordance with laboratory Good Laboratory Practice (GLP) and ISO cold-chain quality controls, please review the following biological specimens or reagents registered under your oversight:
      </p>

      <table class="specimen-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Specimen</th>
            <th>Storage Coordinate</th>
            <th>Expiry</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${samplesListRows}
        </tbody>
      </table>

      <div style="text-align: center; margin: 24px 0 12px;">
        <a href="${portalUrl}" class="button">Open LabLedger Biobank Dashboard &rarr;</a>
      </div>
    </div>
    <div class="footer">
      LabLedger Automated Node-Cron Surveillance System &bull; Specimen Viability Tracker<br>
      Notification automatically generated based on configured storage protocol thresholds.
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
      subject: `⚠️ [LabLedger Alert] ${expiringSamples.length} sample(s) expiring within ${daysThreshold} days`,
      text: `LabLedger Expiry Alert\n\nYou have ${expiringSamples.length} specimen(s) expiring in ${daysThreshold} days:\n${expiringSamples.map(s => `- ${s.sampleId}: ${s.name} (Exp: ${s.expiryDate})`).join('\n')}\n\nPlease visit ${portalUrl} to review.`,
      html: htmlContent,
    };

    const info = await mailClient.sendMail(mailOptions);
    console.log(`✉️ Expiry alert email successfully dispatched to ${to} for ${expiringSamples.length} specimens`);

    return {
      success: true,
      messageId: info.messageId || 'SIMULATED-' + Date.now(),
      recipient: to,
      count: expiringSamples.length
    };
  } catch (err) {
    console.warn(`⚠️ Warning: Could not deliver expiry email to ${to}:`, err.message);
    return {
      success: false,
      error: err.message,
      recipient: to,
      count: expiringSamples.length
    };
  }
}
