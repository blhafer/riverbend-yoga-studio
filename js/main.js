/* ==========================================================
   Riverbend Yoga Studio - main.js
   1. Class finder (Classes and Pricing page)
   2. Request a Spot form validation (Workshops and Events page)
   3. Browser storage with localStorage (both pages)
   ========================================================== */

/* ---------- Data ---------- */

// Every regular weekly class. The finder filters this array.
const weeklyClasses = [
  { id: "mon-gentle", name: "Gentle Yoga", style: "gentle", day: "Monday", time: "9:00 a.m.", period: "morning", minutes: 60, levels: ["new", "some", "regular"] },
  { id: "mon-vinyasa", name: "Vinyasa Flow", style: "vinyasa", day: "Monday", time: "6:00 p.m.", period: "evening", minutes: 60, levels: ["some", "regular"] },
  { id: "tue-vinyasa", name: "Vinyasa Flow", style: "vinyasa", day: "Tuesday", time: "7:00 a.m.", period: "morning", minutes: 45, levels: ["some", "regular"] },
  { id: "wed-lunch", name: "Lunchtime Flow", style: "vinyasa", day: "Wednesday", time: "12:15 p.m.", period: "midday", minutes: 45, levels: ["some", "regular"] },
  { id: "wed-restorative", name: "Restorative Yoga", style: "restorative", day: "Wednesday", time: "7:00 p.m.", period: "evening", minutes: 60, levels: ["new", "some", "regular"] },
  { id: "thu-gentle", name: "Gentle Yoga", style: "gentle", day: "Thursday", time: "9:00 a.m.", period: "morning", minutes: 60, levels: ["new", "some", "regular"] },
  { id: "fri-lunch", name: "Lunchtime Flow", style: "vinyasa", day: "Friday", time: "12:15 p.m.", period: "midday", minutes: 45, levels: ["some", "regular"] },
  { id: "sat-gentle", name: "Gentle Yoga", style: "gentle", day: "Saturday", time: "9:00 a.m.", period: "morning", minutes: 60, levels: ["new", "some", "regular"] },
  { id: "sun-restorative", name: "Restorative Yoga", style: "restorative", day: "Sunday", time: "4:00 p.m.", period: "evening", minutes: 60, levels: ["new", "some", "regular"] }
];

// Short descriptions for each class style, shown on the result cards.
const styleDetails = {
  gentle: "Slow, supported movement with chair options in every class.",
  vinyasa: "Poses linked with the breath in a steady, strength-building flow.",
  restorative: "Long, fully supported rests with bolsters and blankets."
};

// One place for every localStorage key the site uses.
const storageKeys = {
  filters: "riverbend-class-filters",
  savedClasses: "riverbend-saved-classes",
  requestedStyle: "riverbend-requested-style",
  contactDetails: "riverbend-contact-details"
};

/* ---------- Storage helpers ---------- */

// Read a JSON value from localStorage, or return the fallback if nothing is saved
// or storage is unavailable (for example, in some private browsing modes).
function loadData(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch (error) {
    return fallback;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage is unavailable. The page still works; choices just are not remembered.
  }
}

function removeData(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // Nothing to remove.
  }
}

/* ==========================================================
   1. Class finder
   ========================================================== */

function getMatchingClasses(filters) {
  return weeklyClasses.filter(function (yogaClass) {
    const levelMatches = filters.level === "any" || yogaClass.levels.includes(filters.level);
    const timeMatches = filters.period === "any" || yogaClass.period === filters.period;
    return levelMatches && timeMatches;
  });
}

function createClassCard(yogaClass, savedIds) {
  const isSaved = savedIds.includes(yogaClass.id);
  const card = document.createElement("li");
  card.className = "card finder-card";

  const beginnerNote = yogaClass.levels.includes("new")
    ? '<p class="badge">Great for beginners</p>'
    : "";

  card.innerHTML =
    "<h3>" + yogaClass.name + "</h3>" +
    '<p class="meta">' + yogaClass.day + " &middot; " + yogaClass.time + " &middot; " + yogaClass.minutes + " minutes</p>" +
    beginnerNote +
    "<p>" + styleDetails[yogaClass.style] + "</p>" +
    '<p class="card-actions">' +
      '<button type="button" class="button-secondary save-button" data-class-id="' + yogaClass.id + '" aria-pressed="' + isSaved + '">' +
        (isSaved ? "Saved" : "Save this class") +
      "</button>" +
      '<a class="button request-link" href="events.html#request-form" data-style="' + yogaClass.style + '">Request a spot</a>' +
    "</p>";

  return card;
}

function renderClassResults(filters) {
  const resultsList = document.getElementById("finder-results");
  const countMessage = document.getElementById("finder-count");
  const matches = getMatchingClasses(filters);
  const savedIds = loadData(storageKeys.savedClasses, []);

  resultsList.innerHTML = "";
  matches.forEach(function (yogaClass) {
    resultsList.appendChild(createClassCard(yogaClass, savedIds));
  });

  if (matches.length === 0) {
    countMessage.textContent = "No regular classes match those choices yet. Try a different time of day, or ask us about a private session.";
  } else if (matches.length === 1) {
    countMessage.textContent = "1 weekly class matches your choices.";
  } else {
    countMessage.textContent = matches.length + " weekly classes match your choices.";
  }
}

function renderSavedClasses() {
  const savedList = document.getElementById("saved-list");
  const emptyMessage = document.getElementById("saved-empty");
  const savedIds = loadData(storageKeys.savedClasses, []);
  const savedClasses = weeklyClasses.filter(function (yogaClass) {
    return savedIds.includes(yogaClass.id);
  });

  savedList.innerHTML = "";
  savedClasses.forEach(function (yogaClass) {
    const item = document.createElement("li");
    item.textContent = yogaClass.name + ", " + yogaClass.day + " at " + yogaClass.time;
    savedList.appendChild(item);
  });

  emptyMessage.hidden = savedClasses.length > 0;
}

function toggleSavedClass(classId) {
  const savedIds = loadData(storageKeys.savedClasses, []);
  const position = savedIds.indexOf(classId);

  if (position === -1) {
    savedIds.push(classId);
  } else {
    savedIds.splice(position, 1);
  }

  saveData(storageKeys.savedClasses, savedIds);
}

function readFinderFilters() {
  return {
    level: document.getElementById("finder-level").value,
    period: document.getElementById("finder-time").value
  };
}

function applyFinderFilters(filters) {
  document.getElementById("finder-level").value = filters.level;
  document.getElementById("finder-time").value = filters.period;
}

function initClassFinder() {
  const finderForm = document.getElementById("finder-form");
  if (!finderForm) {
    return; // Not on the Classes and Pricing page.
  }

  // Restore the visitor's last choices, or show every class on a first visit.
  const savedFilters = loadData(storageKeys.filters, { level: "any", period: "any" });
  applyFinderFilters(savedFilters);
  renderClassResults(savedFilters);
  renderSavedClasses();

  finderForm.addEventListener("change", function () {
    const filters = readFinderFilters();
    saveData(storageKeys.filters, filters);
    renderClassResults(filters);
  });

  document.getElementById("finder-reset").addEventListener("click", function () {
    const filters = { level: "any", period: "any" };
    applyFinderFilters(filters);
    saveData(storageKeys.filters, filters);
    renderClassResults(filters);
  });

  // One listener handles every card, including cards created after a new filter.
  document.getElementById("finder-results").addEventListener("click", function (event) {
    const saveButton = event.target.closest(".save-button");
    const requestLink = event.target.closest(".request-link");

    if (saveButton) {
      toggleSavedClass(saveButton.dataset.classId);
      renderClassResults(readFinderFilters());
      renderSavedClasses();
    }

    if (requestLink) {
      // Remember the class style so the Request a Spot form can select it.
      saveData(storageKeys.requestedStyle, requestLink.dataset.style);
    }
  });
}

/* ==========================================================
   2. Request a Spot form validation
   ========================================================== */

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^\d{3}-\d{3}-\d{4}$/;

// Each rule checks one field and returns an error message, or "" when the field is valid.
const validationRules = {
  "full-name": function (form) {
    const name = form.elements["full-name"].value.trim();
    if (name === "") {
      return "Please enter your name so we know who to contact.";
    }
    if (name.length < 2) {
      return "Your name needs at least 2 characters.";
    }
    return "";
  },
  email: function (form) {
    const email = form.elements.email.value.trim();
    if (email === "") {
      return "Please enter your email address.";
    }
    if (!emailPattern.test(email)) {
      return "Enter an email address in the format name@example.com.";
    }
    return "";
  },
  experience: function (form) {
    return form.elements.experience.value === ""
      ? "Choose your experience level so we can suggest the right class."
      : "";
  },
  interest: function (form) {
    return form.elements.interest.value === ""
      ? "Choose a class or workshop from the list."
      : "";
  },
  "contact-method": function (form) {
    return form.elements["contact-method"].value === ""
      ? "Choose how you would like us to reach you."
      : "";
  },
  phone: function (form) {
    const phone = form.elements.phone.value.trim();
    const method = form.elements["contact-method"].value;
    const needsPhone = method === "phone" || method === "text";

    if (needsPhone && phone === "") {
      return "Enter a phone number so we can call or text you.";
    }
    if (phone !== "" && !phonePattern.test(phone)) {
      return "Enter your phone number in the format 555-555-5555.";
    }
    return "";
  },
  message: function (form) {
    const length = form.elements.message.value.trim().length;
    if (length < 10) {
      return "Please write at least 10 characters so we understand your request (you have " + length + ").";
    }
    if (length > 500) {
      return "Please keep your message to 500 characters or fewer.";
    }
    return "";
  }
};

function showFieldError(fieldName, message) {
  const errorElement = document.getElementById(fieldName + "-error");
  const field = document.getElementById(fieldName) || document.getElementById(fieldName + "-group");

  errorElement.textContent = message;
  errorElement.hidden = message === "";
  if (field) {
    field.setAttribute("aria-invalid", message === "" ? "false" : "true");
  }
}

function validateField(form, fieldName) {
  const message = validationRules[fieldName](form);
  showFieldError(fieldName, message);
  return message === "";
}

function validateForm(form) {
  let firstInvalid = null;

  Object.keys(validationRules).forEach(function (fieldName) {
    const isValid = validateField(form, fieldName);
    if (!isValid && firstInvalid === null) {
      firstInvalid = fieldName;
    }
  });

  return firstInvalid;
}

function focusField(form, fieldName) {
  const field = form.elements[fieldName];
  // Radio groups return a list; focus the first option in the group.
  const target = field instanceof RadioNodeList ? field[0] : field;
  target.focus();
}

/* ---------- Saved contact details (pre-fill) ---------- */

function saveContactDetails(form) {
  saveData(storageKeys.contactDetails, {
    name: form.elements["full-name"].value.trim(),
    email: form.elements.email.value.trim(),
    contactMethod: form.elements["contact-method"].value,
    phone: form.elements.phone.value.trim()
  });
}

function prefillForm(form) {
  const details = loadData(storageKeys.contactDetails, null);
  const requestedStyle = loadData(storageKeys.requestedStyle, "");
  const note = document.getElementById("saved-details-note");

  if (details) {
    form.elements["full-name"].value = details.name;
    form.elements.email.value = details.email;
    form.elements.phone.value = details.phone;
    if (details.contactMethod) {
      form.elements["contact-method"].value = details.contactMethod;
    }
    document.getElementById("returning-name").textContent = details.name;
    note.hidden = false;
  }

  if (requestedStyle) {
    form.elements.interest.value = requestedStyle;
  }
}

function clearSavedDetails(form) {
  removeData(storageKeys.contactDetails);
  form.elements["full-name"].value = "";
  form.elements.email.value = "";
  form.elements.phone.value = "";
  form.elements["contact-method"].forEach(function (radio) {
    radio.checked = false;
  });
  document.getElementById("saved-details-note").hidden = true;
}

function initRequestForm() {
  const form = document.getElementById("request-spot-form");
  if (!form) {
    return; // Not on the Workshops and Events page.
  }

  // JavaScript takes over validation so messages appear next to each field.
  // Without JavaScript, the HTML required and pattern attributes still apply.
  form.noValidate = true;
  prefillForm(form);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const status = document.getElementById("form-status");
    const firstInvalid = validateForm(form);

    if (firstInvalid) {
      status.textContent = "Please fix the highlighted fields below. Everything you entered is still here.";
      status.className = "form-status is-error";
      focusField(form, firstInvalid);
      return;
    }

    saveContactDetails(form);
    removeData(storageKeys.requestedStyle);
    const firstName = form.elements["full-name"].value.trim().split(" ")[0];
    status.textContent = "Thank you, " + firstName + "! Your request was received. We will reply within one business day.";
    status.className = "form-status is-success";
    form.elements.message.value = "";
    status.focus();
  });

  // Re-check a field as soon as the visitor changes it, so errors clear while they type.
  form.addEventListener("input", function (event) {
    const fieldName = event.target.name;
    const errorElement = document.getElementById(fieldName + "-error");
    if (validationRules[fieldName] && errorElement && !errorElement.hidden) {
      validateField(form, fieldName);
    }
    if (fieldName === "contact-method" && !document.getElementById("phone-error").hidden) {
      validateField(form, "phone");
    }
  });

  document.getElementById("forget-details").addEventListener("click", function () {
    clearSavedDetails(form);
  });
}

/* ---------- Start ---------- */
initClassFinder();
initRequestForm();
