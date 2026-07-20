/**
 * Nutri-Track - Main Application Controller
 * Handles client-side state, local storage synchronization, DOM views, and user interactions.
 */

import { calculateVitals, generateDietPlan, analyzeFoodLog } from './ai-engine.js';

// Pre-populated common food database for instant search lookup
const FOOD_DATABASE = [
  { name: "Egg (Large, Whole)", calories: 74, protein: 6.3, carbs: 0.4, fats: 5 },
  { name: "Egg Whites (Approx. 3 eggs)", calories: 52, protein: 11, carbs: 0.7, fats: 0.2 },
  { name: "Grilled Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  { name: "Baked Salmon Fillet (100g)", calories: 206, protein: 22, carbs: 0, fats: 12 },
  { name: "Lean Sirloin Steak (100g)", calories: 190, protein: 29, carbs: 0, fats: 8 },
  { name: "Canned Tuna in Water (100g)", calories: 116, protein: 26, carbs: 0, fats: 1 },
  { name: "Shrimp (Cooked, 100g)", calories: 99, protein: 24, carbs: 0.2, fats: 0.3 },
  { name: "Firm Tofu (100g)", calories: 144, protein: 17, carbs: 3, fats: 8 },
  { name: "Tempeh (100g)", calories: 193, protein: 19, carbs: 9, fats: 11 },
  
  { name: "White Rice (Cooked, 100g)", calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  { name: "Brown Rice (Cooked, 100g)", calories: 112, protein: 2.6, carbs: 23, fats: 0.9 },
  { name: "Quinoa (Cooked, 100g)", calories: 120, protein: 4.4, carbs: 21.3, fats: 1.9 },
  { name: "Oats (Steel-Cut, 50g dry)", calories: 190, protein: 8, carbs: 33, fats: 3.5 },
  { name: "Sweet Potato (Baked, 100g)", calories: 86, protein: 1.6, carbs: 20, fats: 0.1 },
  { name: "Whole Wheat Bread (1 slice)", calories: 80, protein: 4, carbs: 15, fats: 1 },
  { name: "White Bread (1 slice)", calories: 75, protein: 2, carbs: 15, fats: 1 },
  { name: "Pasta (Cooked, 100g)", calories: 131, protein: 5, carbs: 25, fats: 1.1 },
  
  { name: "Avocado (100g, ~half)", calories: 160, protein: 2, carbs: 8.5, fats: 14.7 },
  { name: "Almonds (1 handful, 30g)", calories: 174, protein: 6.3, carbs: 6.6, fats: 14.7 },
  { name: "Peanut Butter (1 tbsp)", calories: 94, protein: 4, carbs: 3, fats: 8 },
  { name: "Olive Oil (1 tbsp)", calories: 119, protein: 0, carbs: 0, fats: 13.5 },
  { name: "Chia Seeds (1 tbsp, 12g)", calories: 58, protein: 2, carbs: 5, fats: 3.7 },
  
  { name: "Greek Yogurt (Non-Fat, 150g)", calories: 90, protein: 15, carbs: 5, fats: 0.5 },
  { name: "Cottage Cheese (Low-Fat, 150g)", calories: 120, protein: 18, carbs: 6, fats: 2.5 },
  { name: "Whey Protein Powder (1 scoop)", calories: 120, protein: 24, carbs: 3, fats: 1.5 },
  { name: "Milk (2% fat, 250ml cup)", calories: 122, protein: 8.1, carbs: 11.5, fats: 4.8 },
  
  { name: "Banana (1 medium)", calories: 105, protein: 1.3, carbs: 27, fats: 0.3 },
  { name: "Apple (1 medium)", calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
  { name: "Blueberries (100g)", calories: 57, protein: 0.7, carbs: 14.5, fats: 0.3 },
  { name: "Orange (1 medium)", calories: 62, protein: 1.2, carbs: 15.4, fats: 0.2 },
  { name: "Broccoli (Steamed, 100g)", calories: 35, protein: 2.4, carbs: 7, fats: 0.4 },
  { name: "Spinach (Raw, 100g)", calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4 },
  { name: "Cucumber (100g)", calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1 },
  { name: "Celery (100g)", calories: 16, protein: 0.7, carbs: 3, fats: 0.2 },
  
  { name: "Pepperoni Pizza (1 slice)", calories: 290, protein: 12, carbs: 32, fats: 12 },
  { name: "Cheeseburger (Fast-food, regular)", calories: 535, protein: 30, carbs: 40, fats: 28 },
  { name: "French Fries (Medium)", calories: 365, protein: 4, carbs: 48, fats: 17 },
  { name: "Coca-Cola (1 can, 355ml)", calories: 140, protein: 0, carbs: 39, fats: 0 },
  { name: "Glazed Donut (1 item)", calories: 260, protein: 3, carbs: 31, fats: 14 },
  { name: "Potato Chips (1 bag, 50g)", calories: 260, protein: 3, carbs: 27, fats: 16 }
];

// Application State
let state = {
  profile: {
    age: "",
    weight: "",
    height: "",
    gender: "male",
    activity: "moderate",
    goal: "lose-mild",
    dietType: "everything",
    complete: false
  },
  vitals: {
    bmr: 0,
    tdee: 0,
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65
  },
  dietPlan: null,
  logs: [],
  waterIntake: 0,
  theme: "dark"
};

// Global day setting for the diet schedule page
let selectedDietDay = "Monday";

// App Initializer
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initTheme();
  setupNavigation();
  setupOnboardingStepper();
  setupFoodTracker();
  setupWaterTracker();
  renderApp();
  
  // Mobile Hamburger Toggle
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
  
  // Close menu when clicking link
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("show");
    });
  });
});

/**
 * Persist / Retrieve State from Local Storage
 */
function loadState() {
  const savedState = localStorage.getItem("nutri_track_state");
  if (savedState) {
    try {
      state = JSON.parse(savedState);
      // Double check that arrays exist
      if (!state.logs) state.logs = [];
      if (state.waterIntake === undefined) state.waterIntake = 0;
    } catch (e) {
      console.error("Error parsing saved state, resetting storage", e);
    }
  }
}

function saveState() {
  localStorage.setItem("nutri_track_state", JSON.stringify(state));
}

/**
 * Handle Theme Styling Switch
 */
function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  if (state.theme === "light") {
    document.documentElement.classList.add("light-theme");
    themeToggle.innerHTML = "🌙";
  } else {
    document.documentElement.classList.remove("light-theme");
    themeToggle.innerHTML = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    if (document.documentElement.classList.contains("light-theme")) {
      document.documentElement.classList.remove("light-theme");
      themeToggle.innerHTML = "☀️";
      state.theme = "dark";
    } else {
      document.documentElement.classList.add("light-theme");
      themeToggle.innerHTML = "🌙";
      state.theme = "light";
    }
    saveState();
  });
}

/**
 * View Routing Management
 */
function setupNavigation() {
  const navItems = document.querySelectorAll("#nav-links li");
  const views = document.querySelectorAll(".view-panel");

  function switchView(viewId) {
    // If profile setup is not complete and user is trying to access other pages, force profile
    if (!state.profile.complete && viewId !== "profile-view") {
      switchView("profile-view");
      alert("Please complete your profile configuration first so we can tailor the system for you!");
      return;
    }

    views.forEach(view => {
      view.classList.remove("active-view");
      if (view.id === viewId) {
        view.classList.add("active-view");
      }
    });

    navItems.forEach(item => {
      item.classList.remove("active");
      const link = item.querySelector("a");
      if (link && link.getAttribute("data-view") === viewId) {
        item.classList.add("active");
      }
    });

    // Custom view renders
    if (viewId === "dashboard-view") {
      renderDashboard();
    } else if (viewId === "diet-view") {
      renderDietPlanView();
    } else if (viewId === "tracker-view") {
      renderFoodTrackerView();
    } else if (viewId === "profile-view") {
      renderProfileForm();
    }
  }

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const viewId = item.querySelector("a").getAttribute("data-view");
      switchView(viewId);
    });
  });

  // Export router for direct access
  window.navigateToView = switchView;
}

/**
 * Main Application Rendering Dispatcher
 */
function renderApp() {
  if (!state.profile.complete) {
    window.navigateToView("profile-view");
  } else {
    // Re-verify vitals and dietPlan integrity
    if (!state.vitals.calories || isNaN(state.vitals.calories)) {
      state.vitals = calculateVitals(state.profile);
    }
    if (!state.dietPlan) {
      state.dietPlan = generateDietPlan(state.profile, state.vitals);
    }
    window.navigateToView("dashboard-view");
  }
}

/**
 * Profile & Onboarding Stepper Form Logic
 */
function setupOnboardingStepper() {
  const steps = document.querySelectorAll(".form-step");
  const indicators = document.querySelectorAll(".step-indicator");
  const btnPrev = document.getElementById("btn-prev-step");
  const btnNext = document.getElementById("btn-next-step");
  const btnSubmit = document.getElementById("btn-submit-profile");
  
  let currentStepIndex = 0;

  function updateSteps() {
    steps.forEach((step, idx) => {
      step.classList.remove("active");
      if (idx === currentStepIndex) step.classList.add("active");
    });

    indicators.forEach((indicator, idx) => {
      indicator.classList.remove("active", "complete");
      if (idx < currentStepIndex) {
        indicator.classList.add("complete");
      } else if (idx === currentStepIndex) {
        indicator.classList.add("active");
      }
    });

    // Control navigation button displays
    if (currentStepIndex === 0) {
      btnPrev.style.display = "none";
    } else {
      btnPrev.style.display = "inline-flex";
    }

    if (currentStepIndex === steps.length - 1) {
      btnNext.style.display = "none";
      btnSubmit.style.display = "inline-flex";
    } else {
      btnNext.style.display = "inline-flex";
      btnSubmit.style.display = "none";
    }
  }

  btnNext.addEventListener("click", () => {
    // Simple validation for the current step
    if (currentStepIndex === 0) {
      const age = document.getElementById("prof-age").value;
      const weight = document.getElementById("prof-weight").value;
      const height = document.getElementById("prof-height").value;
      if (!age || !weight || !height) {
        alert("Please enter values for Age, Weight, and Height before moving forward.");
        return;
      }
    }
    currentStepIndex++;
    updateSteps();
  });

  btnPrev.addEventListener("click", () => {
    currentStepIndex--;
    updateSteps();
  });

  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Save Form Values to State
    state.profile = {
      age: parseInt(document.getElementById("prof-age").value),
      weight: parseFloat(document.getElementById("prof-weight").value),
      height: parseFloat(document.getElementById("prof-height").value),
      gender: document.getElementById("prof-gender").value,
      activity: document.getElementById("prof-activity").value,
      goal: document.getElementById("prof-goal").value,
      dietType: document.getElementById("prof-diet").value,
      complete: true
    };

    // Trigger AI calculations and plan builders
    state.vitals = calculateVitals(state.profile);
    state.dietPlan = generateDietPlan(state.profile, state.vitals);
    
    // Clear today's log to avoid weird calculations with old profile
    state.logs = [];
    state.waterIntake = 0;

    saveState();
    
    // Animate transition back to dashboard
    currentStepIndex = 0;
    updateSteps();
    
    renderApp();
  });

  // Make update steps publicly reachable
  window.resetOnboarding = () => {
    currentStepIndex = 0;
    updateSteps();
  };
}

/**
 * Populates form inputs with current values when profile page is opened
 */
function renderProfileForm() {
  if (state.profile.complete) {
    document.getElementById("prof-age").value = state.profile.age;
    document.getElementById("prof-weight").value = state.profile.weight;
    document.getElementById("prof-height").value = state.profile.height;
    document.getElementById("prof-gender").value = state.profile.gender;
    document.getElementById("prof-activity").value = state.profile.activity;
    document.getElementById("prof-goal").value = state.profile.goal;
    document.getElementById("prof-diet").value = state.profile.dietType;
  }
}

/**
 * Dashboard View Render Engine
 */
function renderDashboard() {
  // 1. Title section
  const greeting = document.getElementById("dash-greeting");
  const time = new Date();
  const hours = time.getHours();
  let greetText = "Good Evening";
  if (hours < 12) greetText = "Good Morning";
  else if (hours < 17) greetText = "Good Afternoon";
  greeting.textContent = `${greetText}, Athlete!`;

  // Compute daily metrics logs vs vitals
  const analysis = analyzeFoodLog(state.logs, state.vitals);

  // 2. Animate Circular Calorie Gauge
  const circle = document.querySelector(".progress-ring-circle");
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;

  const calPct = Math.min((analysis.totals.calories / state.vitals.calories), 1.25); // cap visual ring at 125%
  const offset = circumference - (calPct * circumference);
  circle.style.strokeDashoffset = offset;
  
  // Dynamic glow depending on targets
  if (analysis.totals.calories > state.vitals.calories) {
    circle.style.stroke = "var(--accent-red)";
  } else {
    circle.style.stroke = "var(--primary)";
  }

  document.getElementById("dash-cal-consumed").textContent = analysis.totals.calories;
  document.getElementById("dash-cal-target").textContent = state.vitals.calories;

  // 3. Macronutrient Linear Progress Bars
  const pBar = document.getElementById("dash-p-bar");
  const cBar = document.getElementById("dash-c-bar");
  const fBar = document.getElementById("dash-f-bar");

  pBar.style.width = `${Math.min(analysis.pct.protein, 100)}%`;
  cBar.style.width = `${Math.min(analysis.pct.carbs, 100)}%`;
  fBar.style.width = `${Math.min(analysis.pct.fats, 100)}%`;

  document.getElementById("dash-p-val").textContent = `${analysis.totals.protein}g / ${state.vitals.protein}g`;
  document.getElementById("dash-c-val").textContent = `${analysis.totals.carbs}g / ${state.vitals.carbs}g`;
  document.getElementById("dash-f-val").textContent = `${analysis.totals.fats}g / ${state.vitals.fats}g`;

  // 4. Quick stats display
  document.getElementById("dash-stat-bmr").textContent = `${state.vitals.bmr} kcal`;
  document.getElementById("dash-stat-tdee").textContent = `${state.vitals.tdee} kcal`;
  
  const netCals = state.vitals.calories - analysis.totals.calories;
  document.getElementById("dash-stat-net").textContent = `${netCals > 0 ? netCals : 0} kcal`;

  // 5. Render Banner AI advice
  document.getElementById("dash-ai-advice").textContent = analysis.feedback;

  // 6. Sync water display
  renderWaterGlasses();
}

/**
 * Render the 7-day Diet Schedule & Grocery Lists
 */
function renderDietPlanView() {
  if (!state.dietPlan) return;

  // Setup tabs handlers
  const tabContainer = document.getElementById("diet-days-tabs");
  tabContainer.innerHTML = "";
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  days.forEach(day => {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm ${selectedDietDay === day ? "btn-primary" : "btn-secondary"}`;
    btn.textContent = day.substring(0, 3);
    btn.addEventListener("click", () => {
      selectedDietDay = day;
      renderDietPlanView();
    });
    tabContainer.appendChild(btn);
  });

  // Render Meals of the Selected Day
  const dayPlan = state.dietPlan.schedule[selectedDietDay];
  const mealContainer = document.getElementById("diet-meals-list");
  mealContainer.innerHTML = "";

  const mealIcons = {
    Breakfast: "🥣",
    Lunch: "🥗",
    Dinner: "🍣",
    Snack: "🥑"
  };

  ["Breakfast", "Lunch", "Dinner", "Snack"].forEach(mealKey => {
    const meal = dayPlan[mealKey];
    
    const card = document.createElement("div");
    card.className = "meal-card";
    card.innerHTML = `
      <div class="meal-image-placeholder">${mealIcons[mealKey]}</div>
      <div class="meal-details">
        <span class="meal-badge">${mealKey}</span>
        <h4 class="meal-name">${meal.name}</h4>
        <p class="meal-portion">Serving Portion: ${meal.portionScale}% of base recipe (scale to your calories)</p>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem; font-style: italic;">
          <strong>Recipe:</strong> ${meal.recipe}
        </p>
        <div class="meal-macros">
          <span>🔥 <strong>${meal.calories}</strong> kcal</span>
          <span>🥩 <strong>${meal.protein}g</strong> Protein</span>
          <span>🌾 <strong>${meal.carbs}g</strong> Carbs</span>
          <span>🥑 <strong>${meal.fats}g</strong> Fats</span>
        </div>
      </div>
    `;
    mealContainer.appendChild(card);
  });

  // Render Grocery list
  const groceryContainer = document.getElementById("grocery-list-container");
  groceryContainer.innerHTML = "";

  state.dietPlan.groceryList.forEach(item => {
    const el = document.createElement("li");
    el.className = `grocery-item ${item.checked ? "checked" : ""}`;
    el.innerHTML = `
      <div class="grocery-checkbox"></div>
      <span>${item.name}</span>
    `;
    el.addEventListener("click", () => {
      item.checked = !item.checked;
      saveState();
      renderDietPlanView();
    });
    groceryContainer.appendChild(el);
  });
}

/**
 * Tracker Screen Logic
 */
function setupFoodTracker() {
  const searchInput = document.getElementById("tracker-search");
  const searchResults = document.getElementById("tracker-search-results");
  const btnCustomAdd = document.getElementById("btn-custom-add-food");
  
  // Custom input fields
  const customName = document.getElementById("food-name-custom");
  const customCal = document.getElementById("food-cal-custom");
  const customP = document.getElementById("food-p-custom");
  const customC = document.getElementById("food-c-custom");
  const customF = document.getElementById("food-f-custom");

  // Search input typing handler
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      searchResults.style.display = "none";
      return;
    }

    const matches = FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(query)).slice(0, 5);
    searchResults.innerHTML = "";
    
    if (matches.length === 0) {
      searchResults.innerHTML = `<div class="search-item">No exact matching food found. Try manual entry.</div>`;
    } else {
      matches.forEach(food => {
        const item = document.createElement("div");
        item.className = "search-item";
        item.innerHTML = `
          <span><strong>${food.name}</strong></span>
          <span style="font-size:0.8rem; color:var(--text-secondary);">${food.calories} cal | P:${food.protein}g | C:${food.carbs}g | F:${food.fats}g</span>
        `;
        item.addEventListener("click", () => {
          logFood(food);
          searchInput.value = "";
          searchResults.style.display = "none";
        });
        searchResults.appendChild(item);
      });
    }
    searchResults.style.display = "block";
  });

  // Hide search dropdown on outer click
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = "none";
    }
  });

  // Custom log add handler
  btnCustomAdd.addEventListener("click", (e) => {
    e.preventDefault();
    const name = customName.value.trim();
    const cals = parseInt(customCal.value);
    const p = parseFloat(customP.value || 0);
    const c = parseFloat(customC.value || 0);
    const f = parseFloat(customF.value || 0);

    if (!name || isNaN(cals)) {
      alert("Please fill out at least Food Name and Calories to log a custom item.");
      return;
    }

    logFood({
      name,
      calories: cals,
      protein: p,
      carbs: c,
      fats: f
    });

    // Reset inputs
    customName.value = "";
    customCal.value = "";
    customP.value = "";
    customC.value = "";
    customF.value = "";
  });

  // Clear all logs handler
  document.getElementById("btn-clear-logs").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all logged food for today?")) {
      state.logs = [];
      saveState();
      renderFoodTrackerView();
    }
  });
}

function logFood(foodItem) {
  const newItem = {
    id: Date.now() + Math.random().toString(36).substr(2, 5),
    name: foodItem.name,
    calories: Math.round(foodItem.calories),
    protein: Number(foodItem.protein || 0),
    carbs: Number(foodItem.carbs || 0),
    fats: Number(foodItem.fats || 0)
  };
  
  state.logs.push(newItem);
  saveState();
  renderFoodTrackerView();
}

function removeLoggedFood(id) {
  state.logs = state.logs.filter(item => item.id !== id);
  saveState();
  renderFoodTrackerView();
}

/**
 * Render Food log tables and advice boxes
 */
function renderFoodTrackerView() {
  const analysis = analyzeFoodLog(state.logs, state.vitals);

  // Render Table Logs
  const tableBody = document.getElementById("food-log-body");
  tableBody.innerHTML = "";

  if (state.logs.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          No foods logged today. Search above or enter details to start tracking!
        </td>
      </tr>
    `;
  } else {
    state.logs.forEach(food => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${food.name}</strong></td>
        <td>🔥 ${food.calories} kcal</td>
        <td>🥩 ${food.protein}g</td>
        <td>🌾 ${food.carbs}g</td>
        <td>🥑 ${food.fats}g</td>
        <td style="text-align: right;">
          <button class="btn btn-danger btn-sm btn-delete-food" data-id="${food.id}">🗑️</button>
        </td>
      `;
      row.querySelector(".btn-delete-food").addEventListener("click", () => {
        removeLoggedFood(food.id);
      });
      tableBody.appendChild(row);
    });
  }

  // Render Summary Targets Footer Row
  document.getElementById("total-calories-logged").textContent = `${analysis.totals.calories} / ${state.vitals.calories} kcal`;
  document.getElementById("total-protein-logged").textContent = `${analysis.totals.protein} / ${state.vitals.protein}g`;
  document.getElementById("total-carbs-logged").textContent = `${analysis.totals.carbs} / ${state.vitals.carbs}g`;
  document.getElementById("total-fats-logged").textContent = `${analysis.totals.fats} / ${state.vitals.fats}g`;

  // Render AI Recommendations
  const eatRecs = document.getElementById("ai-eat-recs");
  const avoidRecs = document.getElementById("ai-avoid-recs");
  
  eatRecs.innerHTML = "";
  avoidRecs.innerHTML = "";

  // Populate Eat list
  analysis.eat.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${item.name}</strong> (${item.unit || "serving"}) - ${item.description}`;
    eatRecs.appendChild(li);
  });

  // Populate Avoid list
  analysis.avoid.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${item.name}</strong>`;
    avoidRecs.appendChild(li);
  });

  // Populate AI Feedback
  document.getElementById("tracker-ai-summary").textContent = analysis.feedback;
}

/**
 * Water Tracker Logic
 */
function setupWaterTracker() {
  const cups = document.querySelectorAll(".water-cup");
  
  cups.forEach((cup, idx) => {
    cup.addEventListener("click", () => {
      // Toggle water levels: if clicked glass is already active, can toggle it off
      if (state.waterIntake === idx + 1) {
        state.waterIntake = idx; // decrease by 1
      } else {
        state.waterIntake = idx + 1; // increase to clicked slot
      }
      saveState();
      renderWaterGlasses();
    });
  });
}

function renderWaterGlasses() {
  const cups = document.querySelectorAll(".water-cup");
  cups.forEach((cup, idx) => {
    if (idx < state.waterIntake) {
      cup.classList.add("filled");
      cup.innerHTML = "💧";
    } else {
      cup.classList.remove("filled");
      cup.innerHTML = "🥛";
    }
  });

  document.getElementById("water-count-text").textContent = `${state.waterIntake} / 8 Cups`;
}
