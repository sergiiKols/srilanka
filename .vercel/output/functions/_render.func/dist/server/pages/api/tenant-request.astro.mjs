import { s as supabase } from '../../chunks/supabase_CyZfh9_5.mjs';
export { renderers } from '../../renderers.mjs';

const TENANT_VALIDATION_RULES = {
  // 📍 ЛОКАЦИЯ
  location: {
    required: true,
    custom: (value) => {
      const validLocations = ["unawatuna", "mirissa", "hikkaduwa", "tangalle", "weligama", "galle", "ahangama"];
      return validLocations.includes(value);
    },
    message: {
      ru: "Выберите локацию",
      en: "Select location"
    }
  },
  // 📅 ДАТЫ
  dates: {
    check_in: {
      required: true,
      custom: (date) => {
        const checkIn = new Date(date);
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        return checkIn >= today;
      },
      message: {
        ru: "Укажите дату заезда (не раньше сегодня)",
        en: "Specify check-in date (not earlier than today)"
      }
    },
    check_out: {
      required: true,
      custom: (date, formData) => {
        const checkIn = new Date(formData.check_in_date);
        const checkOut = new Date(date);
        return checkOut > checkIn;
      },
      message: {
        ru: "Дата выезда должна быть позже даты заезда",
        en: "Check-out date must be after check-in date"
      }
    },
    min_nights: {
      min: 1,
      message: {
        ru: "Минимальная длительность: 1 ночь",
        en: "Minimum stay: 1 night"
      }
    },
    max_nights: {
      max: 365,
      message: {
        ru: "Максимальная длительность: 365 ночей",
        en: "Maximum stay: 365 nights"
      }
    }
  },
  // 👥 ГОСТИ
  guests: {
    adults: {
      min: 1,
      max: 30,
      message: {
        ru: "Укажите количество взрослых (от 1 до 30)",
        en: "Specify number of adults (1 to 30)"
      }
    },
    children: {
      max: 10,
      message: {
        ru: "Максимум 10 детей",
        en: "Maximum 10 children"
      }
    },
    total: {
      required: true,
      min: 1,
      max: 40,
      custom: (_, formData) => {
        const total = (formData.adults_count || 0) + (formData.children_count || 0);
        return total >= 1 && total <= 40;
      },
      message: {
        ru: "Общее количество гостей: от 1 до 40",
        en: "Total guests: 1 to 40"
      }
    },
    guest_type: {
      required: true,
      custom: (value) => {
        return ["family", "friends", "couple", "solo"].includes(value);
      },
      message: {
        ru: "Выберите тип группы",
        en: "Select group type"
      }
    }
  },
  // 🎯 ЦЕЛЬ ПОЕЗДКИ
  purpose: {
    required: true,
    custom: (value) => {
      return ["vacation", "work", "event", "other"].includes(value);
    },
    message: {
      ru: "Укажите цель поездки",
      en: "Specify trip purpose"
    }
  },
  // 🐾 ЖИВОТНЫЕ
  pets: {
    message: {
      ru: "Укажите, будут ли с вами животные",
      en: "Specify if you will bring pets"
    }
  },
  // 💬 ДОПОЛНИТЕЛЬНЫЕ ПОЖЕЛАНИЯ (опционально)
  additional: {
    maxLength: 1e3,
    message: {
      ru: "Максимум 1000 символов",
      en: "Maximum 1000 characters"
    }
  }
};
function calculateFormProgress(formData) {
  const requiredFields = [
    "location",
    "check_in_date",
    "check_out_date",
    "adults_count",
    "guest_type",
    "trip_purpose",
    "has_pets"
  ];
  const filledFields = requiredFields.filter((field) => {
    const value = formData[field];
    return value !== void 0 && value !== null && value !== "";
  });
  return Math.round(filledFields.length / requiredFields.length * 100);
}
function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
  return diffDays;
}
function getFormWarnings(formData) {
  const warnings = [];
  if (formData.trip_purpose === "event") {
    warnings.push({
      field: "trip_purpose",
      message: {
        ru: "⚠️ Мероприятия требуют согласования с арендодателем",
        en: "⚠️ Events require coordination with landlord"
      }
    });
  }
  const totalGuests = (formData.adults_count || 0) + (formData.children_count || 0);
  if (totalGuests > 10) {
    warnings.push({
      field: "guests",
      message: {
        ru: "⚠️ Для больших групп (>10 человек) доступно ограниченное количество объектов",
        en: "⚠️ Limited properties available for large groups (>10 people)"
      }
    });
  }
  if (formData.check_in_date && formData.check_out_date) {
    const nights = calculateNights(formData.check_in_date, formData.check_out_date);
    if (nights > 90) {
      warnings.push({
        field: "dates",
        message: {
          ru: "💡 Для долгосрочной аренды (>3 месяцев) возможны специальные цены",
          en: "💡 Special rates available for long-term rentals (>3 months)"
        }
      });
    }
  }
  return warnings;
}
function getFormHints(formData) {
  const hints = [];
  if (formData.trip_purpose === "work" && !formData.additional_requirements?.includes("WiFi")) {
    hints.push({
      field: "additional",
      message: {
        ru: "💡 Совет: укажите требования к интернету, если работаете удалённо",
        en: "💡 Tip: specify internet requirements if working remotely"
      }
    });
  }
  if (formData.children_count > 0 && !formData.additional_requirements?.includes("кроватка")) {
    hints.push({
      field: "additional",
      message: {
        ru: "💡 Совет: укажите, нужна ли детская кроватка",
        en: "💡 Tip: specify if you need a baby crib"
      }
    });
  }
  return hints;
}

function validateTenantForm(data, language = "ru") {
  const errors = [];
  const warnings = [];
  const hints = [];
  const locationError = validateLocation(data, language);
  if (locationError) errors.push(locationError);
  const dateErrors = validateDates(data, language);
  errors.push(...dateErrors);
  const guestErrors = validateGuests(data, language);
  errors.push(...guestErrors);
  const purposeError = validatePurpose(data, language);
  if (purposeError) errors.push(purposeError);
  const petsError = validatePets(data, language);
  if (petsError) errors.push(petsError);
  const additionalError = validateAdditional(data, language);
  if (additionalError) errors.push(additionalError);
  const formWarnings = getFormWarnings(data);
  warnings.push(...formWarnings.map((w) => ({
    field: w.field,
    message: w.message[language],
    type: "warning"
  })));
  const formHints = getFormHints(data);
  hints.push(...formHints.map((h) => ({
    field: h.field,
    message: h.message[language],
    type: "hint"
  })));
  const progress = calculateFormProgress(data);
  return {
    isValid: errors.length === 0 && progress === 100,
    progress,
    errors,
    warnings,
    hints
  };
}
function validateLocation(data, lang) {
  const rule = TENANT_VALIDATION_RULES.location;
  if (!data.location) {
    return {
      field: "location",
      message: rule.message[lang],
      type: "error"
    };
  }
  if (!rule.custom(data.location)) {
    return {
      field: "location",
      message: rule.message[lang],
      type: "error"
    };
  }
  return null;
}
function validateDates(data, lang) {
  const errors = [];
  const rules = TENANT_VALIDATION_RULES.dates;
  if (!data.check_in_date) {
    errors.push({
      field: "check_in_date",
      message: rules.check_in.message[lang],
      type: "error"
    });
  } else {
    if (!rules.check_in.custom(data.check_in_date)) {
      errors.push({
        field: "check_in_date",
        message: rules.check_in.message[lang],
        type: "error"
      });
    }
  }
  if (!data.check_out_date) {
    errors.push({
      field: "check_out_date",
      message: rules.check_out.message[lang],
      type: "error"
    });
  } else if (data.check_in_date) {
    if (!rules.check_out.custom(data.check_out_date, data)) {
      errors.push({
        field: "check_out_date",
        message: rules.check_out.message[lang],
        type: "error"
      });
    } else {
      const nights = calculateNights(data.check_in_date, data.check_out_date);
      if (nights < rules.min_nights.min) {
        errors.push({
          field: "dates",
          message: rules.min_nights.message[lang],
          type: "error"
        });
      }
      if (nights > rules.max_nights.max) {
        errors.push({
          field: "dates",
          message: rules.max_nights.message[lang],
          type: "error"
        });
      }
    }
  }
  return errors;
}
function validateGuests(data, lang) {
  const errors = [];
  const rules = TENANT_VALIDATION_RULES.guests;
  if (data.adults_count === void 0 || data.adults_count === null) {
    errors.push({
      field: "adults_count",
      message: rules.adults.message[lang],
      type: "error"
    });
  } else if (data.adults_count < rules.adults.min || data.adults_count > rules.adults.max) {
    errors.push({
      field: "adults_count",
      message: rules.adults.message[lang],
      type: "error"
    });
  }
  if (data.children_count !== void 0 && data.children_count > rules.children.max) {
    errors.push({
      field: "children_count",
      message: rules.children.message[lang],
      type: "error"
    });
  }
  if (data.adults_count !== void 0) {
    if (!rules.total.custom(null, data)) {
      errors.push({
        field: "guests",
        message: rules.total.message[lang],
        type: "error"
      });
    }
  }
  if (!data.guest_type) {
    errors.push({
      field: "guest_type",
      message: rules.guest_type.message[lang],
      type: "error"
    });
  } else if (!rules.guest_type.custom(data.guest_type)) {
    errors.push({
      field: "guest_type",
      message: rules.guest_type.message[lang],
      type: "error"
    });
  }
  return errors;
}
function validatePurpose(data, lang) {
  const rule = TENANT_VALIDATION_RULES.purpose;
  if (!data.trip_purpose) {
    return {
      field: "trip_purpose",
      message: rule.message[lang],
      type: "error"
    };
  }
  if (!rule.custom(data.trip_purpose)) {
    return {
      field: "trip_purpose",
      message: rule.message[lang],
      type: "error"
    };
  }
  return null;
}
function validatePets(data, lang) {
  const rule = TENANT_VALIDATION_RULES.pets;
  if (data.has_pets === void 0 || data.has_pets === null) {
    return {
      field: "has_pets",
      message: rule.message[lang],
      type: "error"
    };
  }
  return null;
}
function validateAdditional(data, lang) {
  const rule = TENANT_VALIDATION_RULES.additional;
  if (data.additional_requirements && data.additional_requirements.length > rule.maxLength) {
    return {
      field: "additional_requirements",
      message: rule.message[lang],
      type: "error"
    };
  }
  return null;
}

const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const initData = body.initData;
    if (!initData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing Telegram initData"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const isValid = await validateTelegramWebAppData(initData);
    if (!isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid Telegram signature"
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const telegramData = parseTelegramInitData(initData);
    const formData = {
      location: body.location,
      check_in_date: body.check_in_date,
      check_out_date: body.check_out_date,
      adults_count: body.adults_count,
      children_count: body.children_count || 0,
      guest_type: body.guest_type,
      trip_purpose: body.trip_purpose,
      has_pets: body.has_pets,
      extension_possible: body.extension_possible,
      additional_requirements: body.additional_requirements,
      form_language: body.form_language || "ru"
    };
    const validation = validateTenantForm(formData, formData.form_language);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Validation failed",
          errors: validation.errors,
          warnings: validation.warnings
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const hasDuplicate = await checkDuplicateRequest(
      telegramData.user.id,
      formData.check_in_date,
      formData.check_out_date
    );
    if (hasDuplicate) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Duplicate request",
          message: formData.form_language === "ru" ? "У вас уже есть активная заявка на эти даты" : "You already have an active request for these dates"
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data, error } = await supabase.from("tenant_requests").insert({
      telegram_user_id: telegramData.user.id,
      telegram_username: telegramData.user.username,
      telegram_first_name: telegramData.user.first_name,
      telegram_last_name: telegramData.user.last_name,
      location: formData.location,
      check_in_date: formData.check_in_date,
      check_out_date: formData.check_out_date,
      adults_count: formData.adults_count,
      children_count: formData.children_count,
      guest_type: formData.guest_type,
      trip_purpose: formData.trip_purpose,
      has_pets: formData.has_pets,
      extension_possible: formData.extension_possible,
      additional_requirements: formData.additional_requirements,
      form_language: formData.form_language,
      status: "pending",
      validation_status: "valid",
      source: "telegram_web_app",
      user_agent: request.headers.get("user-agent") || void 0,
      ip_address: request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || void 0
    }).select().single();
    if (error) {
      console.error("Supabase error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database error",
          details: error.message
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    try {
      await sendAdminNotification(data);
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: data.id,
          status: data.status,
          created_at: data.created_at
        },
        message: formData.form_language === "ru" ? "Ваш запрос принят! Мы начинаем подбирать варианты." : "Your request has been received! We are finding options for you."
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: error.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
async function validateTelegramWebAppData(initData) {
  {
    console.warn("TELEGRAM_BOT_TOKEN not set, skipping signature validation");
    return true;
  }
}
function parseTelegramInitData(initData) {
  const params = new URLSearchParams(initData);
  const user = JSON.parse(params.get("user") || "{}");
  return {
    query_id: params.get("query_id"),
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code
    },
    auth_date: params.get("auth_date"),
    hash: params.get("hash")
  };
}
async function checkDuplicateRequest(userId, checkIn, checkOut) {
  const { data } = await supabase.from("tenant_requests").select("id").eq("telegram_user_id", userId).eq("check_in_date", checkIn).eq("check_out_date", checkOut).in("status", ["pending", "processing", "published"]).limit(1);
  return data && data.length > 0 || false;
}
async function sendAdminNotification(request) {
  {
    console.warn("Bot token or admin chat ID not configured");
    return;
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
