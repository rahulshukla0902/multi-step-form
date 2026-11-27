// 1. DATA: plans and add-ons are stored in arrays.

const steps = [1, 2, 3, 4];

const plans = [
  { id: "arcade", name: "Arcade", monthlyPrice: 9, yearlyPrice: 90 },
  { id: "advanced", name: "Advanced", monthlyPrice: 12, yearlyPrice: 120 },
  { id: "pro", name: "Pro", monthlyPrice: 15, yearlyPrice: 150 }
];

const addons = [
  {
    id: "onlineService",
    name: "Online service",
    description: "Access to multiplayer games",
    monthlyPrice: 1,
    yearlyPrice: 10
  },
  {
    id: "largerStorage",
    name: "Larger storage",
    description: "Extra 1TB of cloud save",
    monthlyPrice: 2,
    yearlyPrice: 20
  },
  {
    id: "customizableProfile",
    name: "Customizable Profile",
    description: "Custom theme on your profile",
    monthlyPrice: 2,
    yearlyPrice: 20
  }
];

// 2. SINGLE SOURCE OF TRUTH
// All user input and selections are saved in this object.

const formState = {
  currentStep: 1,
  personalInfo: {
    name: "",
    email: "",
    phone: ""
  },
  selectedPlan: null,
  billingCycle: "monthly",
  selectedAddons: [],
  errors: {},
  isConfirmed: false
};


// 3. GET HTML ELEMENTS
const stepPanels = document.querySelectorAll("[data-step-panel]");
const stepIndicators = document.querySelectorAll("[data-step-indicator]");
const stepContent = document.querySelector("#step-content");

const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");

const billingInput = document.querySelector("#billing-cycle");
const monthlyLabel = document.querySelector("#monthly-label");
const yearlyLabel = document.querySelector("#yearly-label");


// 4. HELPER FUNCTIONS

function getPrice(item) {
  if (formState.billingCycle === "yearly") {
    return item.yearlyPrice;
  }

  return item.monthlyPrice;
}

function getPriceText(price) {
  const period = formState.billingCycle === "yearly" ? "yr" : "mo";
  return `$${price}/${period}`;
}

function getSelectedPlan() {
  return plans.find(function (plan) {
    return plan.id === formState.selectedPlan;
  });
}

function getSelectedAddons() {
  return addons.filter(function (addon) {
    return formState.selectedAddons.includes(addon.id);
  });
}

function calculateTotal() {
  const selectedPlan = getSelectedPlan();

  if (!selectedPlan) {
    return 0;
  }

  let total = getPrice(selectedPlan);

  getSelectedAddons().forEach(function (addon) {
    total += getPrice(addon);
  });

  return total;
}


// 5. SHOW THE CORRECT STEP
// This only changes existing HTML elements.

function showStep() {
  stepPanels.forEach(function (panel) {
    const panelStep = Number(panel.dataset.stepPanel);
    panel.hidden = panelStep !== formState.currentStep;
  });

  stepIndicators.forEach(function (indicator) {
    const indicatorStep = Number(indicator.dataset.stepIndicator);
    const isActive = indicatorStep === formState.currentStep ||
      (formState.isConfirmed && indicatorStep === 4);

    indicator.classList.toggle("active", isActive);

    if (isActive) {
      indicator.setAttribute("aria-current", "step");
    } else {
      indicator.removeAttribute("aria-current");
    }
  });
}

function goToStep(stepNumber) {
  formState.currentStep = stepNumber;
  showStep();
  window.scrollTo({ top: 0, behavior: "smooth" });
}


// 6. PERSONAL INFO VALIDATION

function validateField(fieldName) {
  const value = formState.personalInfo[fieldName].trim();

  if (value === "") {
    return "This field is required";
  }

  if (fieldName === "email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(value)) {
      return "Enter a valid email address";
    }
  }

  if (fieldName === "phone") {
    // Allow only digits and common phone number symbols
    const phonePattern = /^\+?[\d\s()-]+$/;

    if (!phonePattern.test(value)) {
      return "Enter a valid phone number";
    }

    // Count only the actual digits
    const digits = value.replace(/\D/g, "");

    if (digits.length < 10 || digits.length > 15) {
      return "Phone number must have atleast 10 digits";
    }
  }

  return "";
}

// Validate all three fields when clicking Next
function validatePersonalInfo() {
  const fields = ["name", "email", "phone"];

  fields.forEach(function (fieldName) {
    formState.errors[fieldName] = validateField(fieldName);
  });

  showPersonalInfoErrors();

  return Object.values(formState.errors).every(function (error) {
    return error === "";
  });
}

function showPersonalInfoErrors() {
  const fields = ["name", "email", "phone"];

  fields.forEach(function (fieldName) {
    const input = document.querySelector(`#${fieldName}`);
    const errorText = document.querySelector(`#${fieldName}-error`);
    const errorMessage = formState.errors[fieldName] || "";

    errorText.textContent = errorMessage;
    input.classList.toggle("invalid", errorMessage !== "");

    input.setAttribute(
      "aria-invalid",
      errorMessage !== "" ? "true" : "false"
    );
  });
}


// Save input and validate the field if an error exists
function handlePersonalInfoInput(fieldName, input) {
  formState.personalInfo[fieldName] = input.value;

  if (formState.errors[fieldName]) {
    formState.errors[fieldName] = validateField(fieldName);
    showPersonalInfoErrors();
  }
}

nameInput.addEventListener("input", function () {
  handlePersonalInfoInput("name", nameInput);
});

emailInput.addEventListener("input", function () {
  handlePersonalInfoInput("email", emailInput);
});

phoneInput.addEventListener("input", function () {
  handlePersonalInfoInput("phone", phoneInput);
});


// 7. PLAN SELECTION AND BILLING CYCLE

function updatePlanPrices() {
  plans.forEach(function (plan) {
    const priceElement = document.querySelector(`#${plan.id}-price`);
    const freeElement = document.querySelector(`#${plan.id}-free`);
    const radioInput = document.querySelector(`input[name="plan"][value="${plan.id}"]`);
    const planCard = document.querySelector(`[data-plan-card="${plan.id}"]`);

    priceElement.textContent = getPriceText(getPrice(plan));
    freeElement.hidden = formState.billingCycle !== "yearly";

    radioInput.checked = formState.selectedPlan === plan.id;
    planCard.classList.toggle("selected", formState.selectedPlan === plan.id);
  });

  monthlyLabel.classList.toggle("billing-active", formState.billingCycle === "monthly");
  yearlyLabel.classList.toggle("billing-active", formState.billingCycle === "yearly");
  billingInput.checked = formState.billingCycle === "yearly";
}

const planInputs = document.querySelectorAll('input[name="plan"]');

planInputs.forEach(function (input) {
  input.addEventListener("change", function () {
    formState.selectedPlan = input.value;
    document.querySelector("#plan-error").textContent = "";
    updatePlanPrices();
  });
});

billingInput.addEventListener("change", function () {
  formState.billingCycle = billingInput.checked ? "yearly" : "monthly";

  updatePlanPrices();
  updateAddonPrices();
  updateSummary();
});


// 8. ADD-ON SELECTION

function updateAddonPrices() {
  addons.forEach(function (addon) {
    const priceElement = document.querySelector(`#${addon.id}-price`);
    const checkbox = document.querySelector(`input[name="addon"][value="${addon.id}"]`);
    const addonCard = document.querySelector(`[data-addon-card="${addon.id}"]`);
    const isSelected = formState.selectedAddons.includes(addon.id);

    priceElement.textContent = `+${getPriceText(getPrice(addon))}`;
    checkbox.checked = isSelected;
    addonCard.classList.toggle("selected", isSelected);
  });
}

const addonInputs = document.querySelectorAll('input[name="addon"]');

addonInputs.forEach(function (input) {
  input.addEventListener("change", function () {
    if (input.checked) {
      if (!formState.selectedAddons.includes(input.value)) {
        formState.selectedAddons.push(input.value);
      }
    } else {
      formState.selectedAddons = formState.selectedAddons.filter(function (addonId) {
        return addonId !== input.value;
      });
    }

    updateAddonPrices();
    updateSummary();
  });
});

// 9. SUMMARY AND TOTAL PRICE

function updateSummary() {
  const selectedPlan = getSelectedPlan();
  const summaryAddonList = document.querySelector("#summary-addon-list");
  const totalLabel = document.querySelector("#summary-total-label");
  const totalValue = document.querySelector("#summary-total-value");

  if (!selectedPlan) {
    return;
  }

  const billingName = formState.billingCycle === "yearly" ? "Yearly" : "Monthly";
  const periodName = formState.billingCycle === "yearly" ? "year" : "month";

  document.querySelector("#summary-plan-name").textContent = `${selectedPlan.name} (${billingName})`;
  document.querySelector("#summary-plan-price").textContent = getPriceText(getPrice(selectedPlan));
  totalLabel.textContent = `Total (per ${periodName})`;
  totalValue.textContent = getPriceText(calculateTotal());

  // Remove the old list before adding the current selected add-ons.
  summaryAddonList.replaceChildren();

  const selectedAddons = getSelectedAddons();

  if (selectedAddons.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "no-addons";
    emptyMessage.textContent = "No add-ons selected";
    summaryAddonList.appendChild(emptyMessage);
    return;
  }

  selectedAddons.forEach(function (addon) {
    const row = document.createElement("div");
    row.className = "summary-addon-row";

    const name = document.createElement("span");
    name.className = "summary-addon-name";
    name.textContent = addon.name;

    const price = document.createElement("span");
    price.className = "summary-addon-price";
    price.textContent = `+${getPriceText(getPrice(addon))}`;

    row.appendChild(name);
    row.appendChild(price);
    summaryAddonList.appendChild(row);
  });
}


// 10. NEXT, BACK, CHANGE AND CONFIRM BUTTONS

function handleNext() {
  if (formState.currentStep === 1) {
    if (!validatePersonalInfo()) {
      const firstInvalidInput = document.querySelector(".form-input.invalid");

      if (firstInvalidInput) {
        firstInvalidInput.focus();
      }

      return;
    }
  }

  if (formState.currentStep === 2 && formState.selectedPlan === null) {
    document.querySelector("#plan-error").textContent = "Please select a plan";
    return;
  }

  const currentStepIndex = steps.indexOf(formState.currentStep);

  if (currentStepIndex !== -1 && currentStepIndex < steps.length - 1) {
    goToStep(steps[currentStepIndex + 1]);

    if (formState.currentStep === 3) {
      updateAddonPrices();
    }

    if (formState.currentStep === 4) {
      updateSummary();
    }
  }
}

function handleBack() {
  const currentStepIndex = steps.indexOf(formState.currentStep);

  if (currentStepIndex > 0) {
    goToStep(steps[currentStepIndex - 1]);
  }
}

function confirmSubscription() {
  formState.isConfirmed = true;
  formState.currentStep = 5;
  showStep();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Use one click listener for all navigation buttons.
stepContent.addEventListener("click", function (event) {
  const button = event.target.closest("[data-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.action;

  if (action === "next") {
    handleNext();
  }

  if (action === "back") {
    handleBack();
  }

  if (action === "change-plan") {
    goToStep(2);
  }

  if (action === "confirm") {
    confirmSubscription();
  }
});


// 11. INITIAL RENDER

updatePlanPrices();
updateAddonPrices();
updateSummary();
showStep();