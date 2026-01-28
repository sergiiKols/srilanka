import require$$1 from 'crypto';
import CryptoJS from 'crypto-js';

function verifyTelegramWebAppData(initData, botToken) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");
    if (!hash) {
      return false;
    }
    urlParams.delete("hash");
    const dataCheckString = Array.from(urlParams.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("\n");
    const secretKey = require$$1.createHmac("sha256", "WebAppData").update(botToken).digest();
    const calculatedHash = require$$1.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    return calculatedHash === hash;
  } catch (error) {
    console.error("Error verifying Telegram data:", error);
    return false;
  }
}
function decryptBotToken(encrypted, secret) {
  const bytes = CryptoJS.AES.decrypt(encrypted, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
}
async function sendTelegramMessage(params) {
  const { botToken, chatId, text, parseMode = "HTML", disableWebPagePreview = true } = params;
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: disableWebPagePreview
      })
    });
    const data = await response.json();
    if (!data.ok) {
      return {
        success: false,
        error: data.description || "Telegram API error"
      };
    }
    return {
      success: true,
      message_id: data.result.message_id
    };
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function formatMessageTemplate(template, submission, data) {
  let message = template;
  message = message.replace(/{firstName}/g, submission.first_name || "N/A");
  message = message.replace(/{lastName}/g, submission.last_name || "N/A");
  message = message.replace(/{username}/g, submission.username ? `@${submission.username}` : "N/A");
  message = message.replace(/{userId}/g, submission.user_id || "N/A");
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = new RegExp(`{${key}}`, "g");
    message = message.replace(placeholder, String(value || "N/A"));
  });
  return message;
}
function validateFormData(data, fields) {
  const errors = {};
  fields.forEach((field) => {
    const value = data[field.id];
    if (field.required && (!value || value === "")) {
      errors[field.id] = "Это поле обязательно";
      return;
    }
    if (!value) return;
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field.id] = "Неверный формат email";
      }
    }
    if (field.type === "tel" && value) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(value)) {
        errors[field.id] = "Неверный формат телефона";
      }
    }
    if (field.validation) {
      const { min, max, pattern, message } = field.validation;
      if (min !== void 0 && String(value).length < min) {
        errors[field.id] = message || `Минимум ${min} символов`;
      }
      if (max !== void 0 && String(value).length > max) {
        errors[field.id] = message || `Максимум ${max} символов`;
      }
      if (pattern) {
        const regex = new RegExp(pattern);
        if (!regex.test(String(value))) {
          errors[field.id] = message || "Неверный формат";
        }
      }
    }
  });
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
function convertSubmissionsToCSV(submissions) {
  if (submissions.length === 0) return "";
  const dataKeys = /* @__PURE__ */ new Set();
  submissions.forEach((sub) => {
    Object.keys(sub.data).forEach((key) => dataKeys.add(key));
  });
  const headers = [
    "ID",
    "Дата",
    "User ID",
    "Имя",
    "Фамилия",
    "Username",
    "Статус",
    ...Array.from(dataKeys)
  ];
  const rows = submissions.map((sub) => {
    const baseData = [
      sub.id,
      new Date(sub.created_at).toLocaleString("ru-RU"),
      sub.user_id,
      sub.first_name || "",
      sub.last_name || "",
      sub.username || "",
      sub.status
    ];
    const fieldData = Array.from(dataKeys).map((key) => {
      const value = sub.data[key];
      return typeof value === "object" ? JSON.stringify(value) : String(value || "");
    });
    return [...baseData, ...fieldData];
  });
  const csvRows = [headers, ...rows].map(
    (row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
  );
  return csvRows.join("\n");
}

export { validateFormData as a, convertSubmissionsToCSV as c, decryptBotToken as d, formatMessageTemplate as f, sendTelegramMessage as s, verifyTelegramWebAppData as v };
