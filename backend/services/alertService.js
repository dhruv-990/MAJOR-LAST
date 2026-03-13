/**
 * Alert Service – Multi-channel alert dispatcher (Email, Telegram, Dashboard)
 */

const nodemailer = require("nodemailer");
const axios = require("axios");
const Alert = require("../models/Alert");

// ── Email transporter (configure via .env) ──────────────────────
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

/**
 * Determine alert severity based on anomaly score.
 */
function getSeverity(anomalyScore) {
  if (anomalyScore < -0.3) return "critical";
  if (anomalyScore < -0.15) return "high";
  if (anomalyScore < 0) return "medium";
  return "low";
}

/**
 * Build a human-readable alert message.
 */
function buildMessage(anomaly) {
  return (
    `🚨 ANOMALY DETECTED\n` +
    `CPU: ${anomaly.cpu_usage}% | Memory: ${anomaly.memory_usage}%\n` +
    `Disk: ${anomaly.disk_usage}% | Latency: ${anomaly.network_latency}ms\n` +
    `Pod Restarts: ${anomaly.pod_restarts} | Score: ${anomaly.anomaly_score?.toFixed(4)}`
  );
}

/**
 * Send email notification.
 */
async function sendEmail(subject, text) {
  if (!process.env.SMTP_USER) return false;
  try {
    await emailTransporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ALERT_EMAIL || process.env.SMTP_USER,
      subject,
      text,
    });
    console.log("[Alert] Email sent");
    return true;
  } catch (err) {
    console.error("[Alert] Email failed:", err.message);
    return false;
  }
}

/**
 * Send Telegram notification.
 */
async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    });
    console.log("[Alert] Telegram message sent");
    return true;
  } catch (err) {
    console.error("[Alert] Telegram failed:", err.message);
    return false;
  }
}

/**
 * Trigger alerts across all channels for a list of anomalies.
 */
async function triggerAlerts(anomalies) {
  for (const anomaly of anomalies) {
    const severity = getSeverity(anomaly.anomaly_score);
    const message = buildMessage(anomaly);
    const channelsNotified = ["dashboard"];

    // Always persist to dashboard
    const alert = await Alert.create({
      type: "anomaly",
      severity,
      message,
      metric_snapshot: {
        cpu_usage: anomaly.cpu_usage,
        memory_usage: anomaly.memory_usage,
        disk_usage: anomaly.disk_usage,
        network_latency: anomaly.network_latency,
        pod_restarts: anomaly.pod_restarts,
        anomaly_score: anomaly.anomaly_score,
      },
      channels_notified: channelsNotified,
    });

    // Email
    const emailSent = await sendEmail("🚨 Outage Sense – Anomaly Detected", message);
    if (emailSent) channelsNotified.push("email");

    // Telegram
    const telegramSent = await sendTelegram(message);
    if (telegramSent) channelsNotified.push("telegram");

    // Update channels
    alert.channels_notified = channelsNotified;
    await alert.save();

    console.log(
      `[Alert] ${severity.toUpperCase()} alert created (channels: ${channelsNotified.join(", ")})`
    );
  }
}

module.exports = { triggerAlerts, sendEmail, sendTelegram };
