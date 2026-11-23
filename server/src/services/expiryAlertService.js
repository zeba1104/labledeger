import cron from 'node-cron';
import { getCollection } from '../models/dbAdapter.js';
import { sendExpiryAlertMail } from './mailService.js';
import { logAudit } from './auditService.js';

/**
 * Surveillance function: Scans specimen inventory for upcoming expiration dates,
 * calculates days remaining, and dispatches automated nodemailer alerts to specimen owners.
 *
 * @param {number} daysThreshold - Number of days to look ahead (default 7 days)
 * @param {boolean} sendEmails - Whether to dispatch live nodemailer emails (default true)
 */
export async function checkAndNotifyExpiringSamples(daysThreshold = 7, sendEmails = true) {
  try {
    const samples = getCollection('samples') || [];
    const users = getCollection('users') || [];
    const now = new Date();

    const expiringSoon = [];
    const expired = [];

    samples.forEach(sample => {
      if (!sample.expiryDate) return;

      const expiry = new Date(sample.expiryDate);
      if (isNaN(expiry.getTime())) return;

      // Calendar day difference (comparing midnight UTC to midnight UTC)
      const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const expiryDay = new Date(Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth(), expiry.getUTCDate()));
      const daysRemaining = Math.round((expiryDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

      const specimenInfo = {
        _id: sample._id,
        sampleId: sample.sampleId,
        name: sample.name,
        type: sample.type,
        quantity: sample.quantity,
        unit: sample.unit,
        storagePath: sample.storagePath,
        storageLocation: sample.storageLocation,
        registeredBy: sample.registeredBy || 'Lab Director',
        expiryDate: sample.expiryDate,
        daysRemaining,
        status: sample.status
      };

      if (daysRemaining < 0) {
        expired.push(specimenInfo);
      } else if (daysRemaining <= daysThreshold) {
        expiringSoon.push(specimenInfo);
      }
    });

    console.log(`🔍 [Surveillance Check] Found ${expiringSoon.length} samples expiring in <=${daysThreshold} days, and ${expired.length} expired samples.`);

    let dispatchResults = [];

    if (sendEmails && expiringSoon.length > 0) {
      // Group expiring specimens by registered researcher/owner
      const groupedByRecipient = {};

      expiringSoon.forEach(sample => {
        // Find matching registered user
        const matchedUser = users.find(u =>
          (u.name && sample.registeredBy && u.name.trim().toLowerCase() === sample.registeredBy.trim().toLowerCase()) ||
          (u.email && sample.registeredBy && u.email.trim().toLowerCase() === sample.registeredBy.trim().toLowerCase())
        );

        const email = matchedUser?.email || (sample.registeredBy?.includes('@') ? sample.registeredBy : 'admin@labledger.com');
        const ownerName = matchedUser?.name || sample.registeredBy || 'Laboratory Researcher';

        if (!groupedByRecipient[email]) {
          groupedByRecipient[email] = {
            ownerName,
            samples: []
          };
        }
        groupedByRecipient[email].samples.push(sample);
      });

      // Dispatch automated alert email to each sample owner
      for (const [email, data] of Object.entries(groupedByRecipient)) {
        try {
          const result = await sendExpiryAlertMail({
            to: email,
            ownerName: data.ownerName,
            expiringSamples: data.samples,
            daysThreshold
          });
          dispatchResults.push(result);
        } catch (err) {
          console.error(`Failed to send alert to ${email}:`, err.message);
          dispatchResults.push({ success: false, recipient: email, error: err.message });
        }
      }

      // Log system audit entry
      try {
        logAudit({
          action: 'EXPIRY_ALERT_SURVEILLANCE',
          performedBy: 'System (node-cron)',
          performedRole: 'Surveillance Daemon',
          entityType: 'Sample',
          entityId: `BATCH-${Date.now().toString(36).toUpperCase()}`,
          details: `Automated scan identified ${expiringSoon.length} specimen(s) expiring within ${daysThreshold} days. Dispatched email notices to ${Object.keys(groupedByRecipient).length} owner(s).`,
          newData: {
            expiringCount: expiringSoon.length,
            expiredCount: expired.length,
            recipients: Object.keys(groupedByRecipient)
          }
        });
      } catch (auditErr) {
        console.warn('Audit log error:', auditErr.message);
      }
    }

    return {
      success: true,
      timestamp: now.toISOString(),
      daysThreshold,
      expiringCount: expiringSoon.length,
      expiredCount: expired.length,
      expiringSoon,
      expired,
      dispatchResults
    };
  } catch (error) {
    console.error('Error during checkAndNotifyExpiringSamples:', error);
    return {
      success: false,
      error: error.message,
      expiringCount: 0,
      expiredCount: 0,
      expiringSoon: [],
      expired: [],
      dispatchResults: []
    };
  }
}

/**
 * Initializes the automated node-cron schedule.
 * Runs once every 24 hours at 08:00 AM server time.
 */
let cronJob = null;
export function initExpiryCron() {
  if (cronJob) return cronJob;

  try {
    // Daily at 08:00 AM: '0 8 * * *'
    cronJob = cron.schedule('0 8 * * *', async () => {
      console.log('⏰ [node-cron] Running daily 08:00 AM sample expiry & storage check...');
      await checkAndNotifyExpiringSamples(7, true);
    });

    console.log('⏱️ [node-cron] Daily sample storage & expiry surveillance scheduled (runs daily at 08:00 AM).');
    return cronJob;
  } catch (err) {
    console.warn('⚠️ Could not initialize node-cron job:', err.message);
    return null;
  }
}
