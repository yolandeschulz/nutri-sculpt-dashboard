(function () {
  const DATA = window.NUTRI_SCULPT_DATA;
  const STORAGE_KEY = "nutriSculptDashboardState.v1";
  const DAYS = DATA.days;
  const STATUSES = ["Need to buy", "Already have", "Optional", "Skip"];
  const CATEGORY_ORDER = ["Protein", "Dairy", "Fruit and veg", "Carbs", "Sauces", "Pantry"];
  const SLOTS = [
    { key: "breakfast", label: "Breakfast", types: ["Breakfast"] },
    { key: "lunch", label: "Lunch", types: ["Lunch or Dinner"] },
    { key: "dinner", label: "Dinner", types: ["Lunch or Dinner"] },
    { key: "carbSnack", label: "Carb Snack", types: ["Carb Snack"] },
    { key: "proteinSnack", label: "High Protein Snack", types: ["High Protein Snack"] }
  ];
  const DAILY_CHECKS = [
    { key: "water", label: "Water 2-3 L" },
    { key: "proteinMoreThanCarbs", label: "Protein more than carbs" },
    { key: "noSugaryDrinks", label: "No sugary drinks" },
    { key: "noSweets", label: "No sweets" },
    { key: "avoidedFastFood", label: "Avoided fast food" },
    { key: "highProteinSnack", label: "High protein snack" },
    { key: "active", label: "Workout/activity done" },
    { key: "alcoholLimited", label: "Alcohol limited/avoided" },
    { key: "mealTimes", label: "Meal times consistent" },
    { key: "prepAhead", label: "Prep ahead" }
  ];

  const recipes = DATA.recipes.map((recipe, index) => ({
    ...recipe,
    id: slug(`${index}-${recipe.name}`)
  }));
  const recipeByName = new Map(recipes.map((recipe) => [recipe.name, recipe]));
  const types = [...new Set(recipes.map((recipe) => recipe.type))];
  const workoutPhases = [...new Set(DATA.workouts.map((workout) => workout.phase))];

  const elements = {
    activeWeek: document.querySelector("#activeWeek"),
    todayDay: document.querySelector("#todayDay"),
    todayTitle: document.querySelector("#todayTitle"),
    todayMeals: document.querySelector("#todayMeals"),
    todayNotes: document.querySelector("#todayNotes"),
    dailyChecks: document.querySelector("#dailyChecks"),
    weekGrid: document.querySelector("#weekGrid"),
    mealSearch: document.querySelector("#mealSearch"),
    mealTypeFilter: document.querySelector("#mealTypeFilter"),
    sortMeals: document.querySelector("#sortMeals"),
    mealCards: document.querySelector("#mealCards"),
    showAllShopping: document.querySelector("#showAllShopping"),
    shoppingList: document.querySelector("#shoppingList"),
    workoutPhase: document.querySelector("#workoutPhase"),
    workoutGrid: document.querySelector("#workoutGrid"),
    measurementTable: document.querySelector("#measurementTable"),
    photoGuidelines: document.querySelector("#photoGuidelines"),
    weeklyReflection: document.querySelector("#weeklyReflection"),
    rulesList: document.querySelector("#rulesList"),
    instructionsList: document.querySelector("#instructionsList"),
    statMeals: document.querySelector("#statMeals"),
    statShopping: document.querySelector("#statShopping"),
    statRules: document.querySelector("#statRules"),
    statWorkouts: document.querySelector("#statWorkouts"),
    toast: document.querySelector("#toast")
  };

  let state = loadState();

  initialiseControls();
  attachEvents();
  registerServiceWorker();
  renderAll();

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function defaultState() {
    const plan = {};
    for (let week = 1; week <= 8; week += 1) {
      plan[week] = {};
      for (const day of DAYS) {
        plan[week][day] = {};
        for (const slot of SLOTS) {
          plan[week][day][slot.key] = "";
        }
      }
    }

    return {
      activeWeek: 1,
      todayDay: dayFromToday(),
      mealSearch: "",
      mealTypeFilter: "All",
      sortMeals: "pdf",
      showAllShopping: false,
      workoutPhase: "Week 1-2",
      plan,
      ingredients: {},
      daily: {},
      notes: {},
      workouts: {},
      measurements: {},
      reflections: {},
      photoChecks: {}
    };
  }

  function dayFromToday() {
    const index = new Date().getDay();
    return DAYS[index === 0 ? 6 : index - 1] || "Monday";
  }

  function loadState() {
    const base = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return mergeState(base, saved);
    } catch {
      return base;
    }
  }

  function mergeState(base, saved) {
    return {
      ...base,
      ...saved,
      plan: { ...base.plan, ...(saved.plan || {}) },
      ingredients: { ...base.ingredients, ...(saved.ingredients || {}) },
      daily: { ...base.daily, ...(saved.daily || {}) },
      notes: { ...base.notes, ...(saved.notes || {}) },
      workouts: { ...base.workouts, ...(saved.workouts || {}) },
      measurements: { ...base.measurements, ...(saved.measurements || {}) },
      reflections: { ...base.reflections, ...(saved.reflections || {}) },
      photoChecks: { ...base.photoChecks, ...(saved.photoChecks || {}) }
    };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function initialiseControls() {
    elements.activeWeek.innerHTML = Array.from({ length: 8 }, (_, index) => {
      const week = index + 1;
      return `<option value="${week}">Week ${week}</option>`;
    }).join("");
    elements.todayDay.innerHTML = DAYS.map((day) => `<option value="${day}">${day}</option>`).join("");
    elements.mealTypeFilter.innerHTML = ["All", ...types].map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("");
    elements.workoutPhase.innerHTML = workoutPhases.map((phase) => `<option value="${escapeHtml(phase)}">${escapeHtml(phase)}</option>`).join("");

    elements.activeWeek.value = state.activeWeek;
    elements.todayDay.value = state.todayDay;
    elements.mealSearch.value = state.mealSearch;
    elements.mealTypeFilter.value = state.mealTypeFilter;
    elements.sortMeals.value = state.sortMeals;
    elements.showAllShopping.checked = state.showAllShopping;
    elements.workoutPhase.value = state.workoutPhase;
  }

  function attachEvents() {
    document.querySelectorAll(".tab").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
        document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
        button.classList.add("active");
        document.querySelector(`#view-${button.dataset.view}`).classList.add("active");
      });
    });

    elements.activeWeek.addEventListener("change", () => {
      state.activeWeek = Number(elements.activeWeek.value);
      state.workoutPhase = phaseForWeek(state.activeWeek);
      elements.workoutPhase.value = state.workoutPhase;
      saveAndRender();
    });

    elements.todayDay.addEventListener("change", () => {
      state.todayDay = elements.todayDay.value;
      saveAndRender();
    });

    elements.todayNotes.addEventListener("input", () => {
      state.notes[noteKey()] = elements.todayNotes.value;
      saveState();
    });

    elements.mealSearch.addEventListener("input", () => {
      state.mealSearch = elements.mealSearch.value;
      saveAndRender(["meals"]);
    });

    elements.mealTypeFilter.addEventListener("change", () => {
      state.mealTypeFilter = elements.mealTypeFilter.value;
      saveAndRender(["meals"]);
    });

    elements.sortMeals.addEventListener("change", () => {
      state.sortMeals = elements.sortMeals.value;
      saveAndRender(["meals"]);
    });

    elements.showAllShopping.addEventListener("change", () => {
      state.showAllShopping = elements.showAllShopping.checked;
      saveAndRender(["shopping", "stats"]);
    });

    elements.workoutPhase.addEventListener("change", () => {
      state.workoutPhase = elements.workoutPhase.value;
      saveAndRender(["workouts", "stats"]);
    });

    elements.weeklyReflection.addEventListener("input", () => {
      state.reflections[state.activeWeek] = elements.weeklyReflection.value;
      saveState();
    });

    document.querySelector("#resetDemo").addEventListener("click", () => {
      if (!confirm("Clear saved ticks, notes, meal choices and shopping statuses for this dashboard?")) return;
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState();
      initialiseControls();
      saveAndRender();
      toast("Dashboard reset.");
    });

    document.querySelector("#printToday").addEventListener("click", () => printView("today"));
    document.querySelector("#printWeek").addEventListener("click", () => printView("week"));
    document.querySelector("#printShopping").addEventListener("click", () => printView("shopping"));
    document.querySelector("#copyShopping").addEventListener("click", copyShoppingList);

    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-plan-slot]")) {
        handlePlanSlotChange(target);
      }

      if (target.matches("[data-ingredient-status]")) {
        state.ingredients[target.dataset.ingredientStatus] = target.value;
        saveAndRender(["shopping", "meals", "stats"]);
      }

      if (target.matches("[data-daily-check]")) {
        const key = dailyKey(state.activeWeek, state.todayDay);
        state.daily[key] = state.daily[key] || {};
        state.daily[key][target.dataset.dailyCheck] = target.checked;
        saveAndRender(["today", "stats"]);
      }

      if (target.matches("[data-workout-check]")) {
        state.workouts[target.dataset.workoutCheck] = target.checked;
        saveAndRender(["workouts", "stats"]);
      }

      if (target.matches("[data-photo-check]")) {
        state.photoChecks[target.dataset.photoCheck] = target.checked;
        saveState();
      }

      if (target.matches("[data-measurement]")) {
        const key = target.dataset.measurement;
        state.measurements[key] = target.value;
        saveState();
      }
    });

    document.addEventListener("input", (event) => {
      const target = event.target;
      if (target.matches("[data-plan-slot]")) {
        handlePlanSlotChange(target);
      }
    });
  }

  function handlePlanSlotChange(target) {
    const { day, slot } = target.dataset;
    ensurePlanDay(state.activeWeek, day);
    if (state.plan[state.activeWeek][day][slot] === target.value) return;
    state.plan[state.activeWeek][day][slot] = target.value;
    const recipe = recipeByName.get(target.value);
    saveAndRender(["today", "week", "shopping", "meals", "stats"]);
    if (recipe) {
      toast(`${recipe.name} added to ${day}. Shopping list updated.`);
    }
  }

  function saveAndRender(parts) {
    saveState();
    renderAll(parts);
  }

  function renderAll(parts) {
    const everything = !Array.isArray(parts);
    if (everything || parts.includes("today")) renderToday();
    if (everything || parts.includes("week")) renderWeek();
    if (everything || parts.includes("meals")) renderMeals();
    if (everything || parts.includes("shopping")) renderShopping();
    if (everything || parts.includes("workouts")) renderWorkouts();
    if (everything || parts.includes("progress")) renderProgress();
    if (everything || parts.includes("rules")) renderRules();
    if (everything || parts.includes("stats")) renderStats();
  }

  function renderToday() {
    const day = state.todayDay;
    ensurePlanDay(state.activeWeek, day);
    const plan = state.plan[state.activeWeek][day];
    elements.todayTitle.textContent = `Week ${state.activeWeek} - ${day}`;
    elements.todayNotes.value = state.notes[noteKey()] || "";
    elements.todayMeals.innerHTML = SLOTS.map((slot) => {
      const recipe = recipeByName.get(plan[slot.key]);
      return `
        <article class="summary-tile">
          <strong>${escapeHtml(slot.label)}</strong>
          <div>${recipe ? escapeHtml(recipe.name) : "Choose in This Week"}</div>
          ${recipe ? macroHtml(recipe) : ""}
        </article>
      `;
    }).join("");

    const currentChecks = state.daily[dailyKey(state.activeWeek, day)] || {};
    elements.dailyChecks.innerHTML = DAILY_CHECKS.map((check) => `
      <label class="check-item">
        <input type="checkbox" data-daily-check="${check.key}" ${currentChecks[check.key] ? "checked" : ""}>
        <span>${escapeHtml(check.label)}</span>
      </label>
    `).join("");
  }

  function renderWeek() {
    elements.weekGrid.innerHTML = DAYS.map((day) => {
      ensurePlanDay(state.activeWeek, day);
      const dayPlan = state.plan[state.activeWeek][day];
      const meals = SLOTS.map((slot) => recipeByName.get(dayPlan[slot.key])).filter(Boolean);
      const macros = sumMacros(meals);
      return `
        <article class="day-card">
          <h3>${escapeHtml(day)}</h3>
          ${SLOTS.map((slot) => mealSelectHtml(day, slot, dayPlan[slot.key])).join("")}
          <div class="day-macros">${macroSummary(macros)}</div>
        </article>
      `;
    }).join("");
  }

  function mealSelectHtml(day, slot, selected) {
    const selectedRecipe = recipeByName.get(selected);
    const options = recipes
      .filter((recipe) => slot.types.includes(recipe.type))
      .map((recipe) => `<option value="${escapeHtml(recipe.name)}" ${recipe.name === selected ? "selected" : ""}>${escapeHtml(recipe.name)}</option>`)
      .join("");
    return `
      <div class="meal-slot">
        <label>${escapeHtml(slot.label)}</label>
        <select class="field" data-plan-slot="${slot.key}" data-day="${escapeHtml(day)}">
          <option value="">Choose</option>
          ${options}
        </select>
        ${selectedRecipe ? selectedMealPreviewHtml(selectedRecipe) : emptyMealPreviewHtml(slot)}
      </div>
    `;
  }

  function selectedMealPreviewHtml(recipe) {
    const ingredients = (recipe.ingredients || []).slice(0, 4).map((ingredient) => ingredient.item).join(", ");
    return `
      <div class="selected-meal-preview is-filled" aria-live="polite">
        <strong>${escapeHtml(recipe.name)}</strong>
        ${macroHtml(recipe)}
        <span class="item-meta">Shopping added: ${escapeHtml(ingredients)}${(recipe.ingredients || []).length > 4 ? "..." : ""}</span>
      </div>
    `;
  }

  function emptyMealPreviewHtml(slot) {
    return `
      <div class="selected-meal-preview">
        Pick a ${escapeHtml(slot.label.toLowerCase())} to fill this card and update the shopping list.
      </div>
    `;
  }

  function renderMeals() {
    const search = state.mealSearch.trim().toLowerCase();
    const selectedType = state.mealTypeFilter;
    let list = recipes.filter((recipe) => {
      const matchesType = selectedType === "All" || recipe.type === selectedType;
      const text = `${recipe.name} ${recipe.type} ${(recipe.ingredients || []).map((ingredient) => ingredient.item).join(" ")}`.toLowerCase();
      return matchesType && (!search || text.includes(search));
    });

    list = sortMealList(list);
    elements.mealCards.innerHTML = list.map((recipe) => mealCardHtml(recipe)).join("");
  }

  function sortMealList(list) {
    const sorted = [...list];
    if (state.sortMeals === "ready") {
      sorted.sort((a, b) => mealScore(b).score - mealScore(a).score || a.name.localeCompare(b.name));
    } else if (state.sortMeals === "protein") {
      sorted.sort((a, b) => (Number(b.protein_g) || 0) - (Number(a.protein_g) || 0));
    } else if (state.sortMeals === "calories") {
      sorted.sort((a, b) => (Number(a.calories) || 9999) - (Number(b.calories) || 9999));
    }
    return sorted;
  }

  function mealCardHtml(recipe) {
    const score = mealScore(recipe);
    return `
      <article class="meal-card">
        <div class="meal-card-header">
          <div>
            <h3>${escapeHtml(recipe.name)}</h3>
            ${macroHtml(recipe)}
          </div>
          <span class="type-badge">${escapeHtml(recipe.type)}</span>
        </div>
        <div class="day-macros">Ready from home: ${Math.round(score.score * 100)}% (${score.have}/${score.total} items)</div>
        ${recipe.notes ? `<p class="item-meta">${escapeHtml(recipe.notes)}</p>` : ""}
        <ul class="ingredients">
          ${(recipe.ingredients || []).map((ingredient) => ingredientRowHtml(ingredient, true)).join("")}
        </ul>
      </article>
    `;
  }

  function ingredientRowHtml(ingredient, editable) {
    const status = ingredientStatus(ingredient.item);
    return `
      <li>
        <span><strong>${escapeHtml(ingredient.item)}</strong><br><span class="item-meta">${escapeHtml(ingredient.amount || "")}</span></span>
        ${editable ? statusSelectHtml(ingredient.item, status) : `<span class="pill ${statusClass(status)}">${escapeHtml(status)}</span>`}
      </li>
    `;
  }

  function renderShopping() {
    const items = aggregateShopping(state.showAllShopping ? "all" : "selected");
    if (!items.length) {
      elements.shoppingList.innerHTML = `
        <section class="shopping-category">
          <h3>No meals selected yet</h3>
          <div class="shopping-item">
            <div class="item-title">Go to This Week and choose meals first.</div>
            <div></div><div></div><div></div>
          </div>
        </section>
      `;
      return;
    }

    const grouped = groupBy(items, "category");
    elements.shoppingList.innerHTML = CATEGORY_ORDER
      .filter((category) => grouped[category])
      .map((category) => `
        <section class="shopping-category">
          <h3>${escapeHtml(category)} (${grouped[category].length})</h3>
          ${grouped[category].map((item) => shoppingItemHtml(item)).join("")}
        </section>
      `).join("");
  }

  function shoppingItemHtml(item) {
    const status = ingredientStatus(item.item);
    return `
      <div class="shopping-item">
        <div>
          <div class="item-title">${escapeHtml(item.item)}</div>
          <div class="item-meta">${escapeHtml(item.amounts.join("; "))}</div>
        </div>
        ${statusSelectHtml(item.item, status)}
        <div class="item-meta"><strong>Used in:</strong> ${escapeHtml(item.usedIn.join("; "))}</div>
        <span class="pill ${statusClass(status)}">${escapeHtml(status)}</span>
      </div>
    `;
  }

  function statusSelectHtml(item, status) {
    return `
      <select class="field status-select" data-ingredient-status="${escapeHtml(item)}">
        ${STATUSES.map((option) => `<option value="${escapeHtml(option)}" ${option === status ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
      </select>
    `;
  }

  function renderWorkouts() {
    const phase = state.workoutPhase;
    const byDay = groupBy(DATA.workouts.filter((workout) => workout.phase === phase), "day");
    elements.workoutGrid.innerHTML = Object.entries(byDay).map(([day, workouts]) => `
      <section class="workout-day">
        <h3>${escapeHtml(day)} - ${escapeHtml(workouts[0].focus)}</h3>
        <p class="item-meta">${escapeHtml(workouts[0].duration)}</p>
        ${workouts.map((workout) => workoutHtml(workout)).join("")}
      </section>
    `).join("");
  }

  function workoutHtml(workout) {
    const key = workoutKey(workout);
    return `
      <details class="exercise">
        <summary>
          <span>${escapeHtml(workout.exercise)}</span>
          <label class="toggle-row" onclick="event.stopPropagation()">
            <input type="checkbox" data-workout-check="${escapeHtml(key)}" ${state.workouts[key] ? "checked" : ""}>
            <span>Done</span>
          </label>
        </summary>
        <div class="exercise-body">
          <div><strong>Sets:</strong> ${escapeHtml(workout.sets)}</div>
          <div><strong>Reps/time:</strong> ${escapeHtml(workout.reps)}</div>
        </div>
      </details>
    `;
  }

  function renderProgress() {
    elements.measurementTable.innerHTML = measurementTableHtml();
    elements.photoGuidelines.innerHTML = DATA.photo_guidelines.map((text, index) => {
      const key = `photo-${index}`;
      return `
        <label class="check-item">
          <input type="checkbox" data-photo-check="${key}" ${state.photoChecks[key] ? "checked" : ""}>
          <span>${escapeHtml(text)}</span>
        </label>
      `;
    }).join("");
    elements.weeklyReflection.value = state.reflections[state.activeWeek] || "";
  }

  function measurementTableHtml() {
    const header = `<tr><th>Measurement</th>${Array.from({ length: 8 }, (_, i) => `<th>Week ${i + 1}</th>`).join("")}</tr>`;
    const rows = DATA.measurements.map((measurement) => {
      const cells = Array.from({ length: 8 }, (_, index) => {
        const key = `${measurement}|${index + 1}`;
        return `<td><input data-measurement="${escapeHtml(key)}" value="${escapeHtml(state.measurements[key] || "")}" inputmode="decimal"></td>`;
      }).join("");
      return `<tr><td><strong>${escapeHtml(measurement)}</strong></td>${cells}</tr>`;
    }).join("");
    return `<table>${header}${rows}</table>`;
  }

  function renderRules() {
    elements.rulesList.innerHTML = DATA.daily_guidelines.map((text) => `<div class="rule-card">${escapeHtml(text)}</div>`).join("");
    elements.instructionsList.innerHTML = DATA.meal_plan_instructions.map((text) => `<div class="rule-card">${escapeHtml(text)}</div>`).join("");
  }

  function renderStats() {
    const selectedShopping = aggregateShopping("selected");
    const needCount = selectedShopping.filter((item) => ingredientStatus(item.item) === "Need to buy").length;
    const dailyPercent = weeklyDailyPercent();
    const workoutCount = completedWorkoutDaysForWeek();

    elements.statMeals.textContent = recipes.length;
    elements.statShopping.textContent = needCount;
    elements.statRules.textContent = `${dailyPercent}%`;
    elements.statWorkouts.textContent = `${workoutCount}/3`;
  }

  function aggregateShopping(scope) {
    const selected = selectedRecipeNamesForWeek();
    const included = scope === "all" ? recipes : recipes.filter((recipe) => selected.includes(recipe.name));
    const map = new Map();
    for (const recipe of included) {
      for (const ingredient of recipe.ingredients || []) {
        const item = ingredient.item;
        if (!map.has(item)) {
          map.set(item, {
            category: ingredient.category || "Pantry",
            item,
            amounts: new Set(),
            usedIn: new Set()
          });
        }
        const current = map.get(item);
        if (ingredient.amount) current.amounts.add(ingredient.amount);
        current.usedIn.add(recipe.name);
      }
    }

    return [...map.values()]
      .map((item) => ({ ...item, amounts: [...item.amounts], usedIn: [...item.usedIn] }))
      .sort((a, b) => {
        const categorySort = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
        return categorySort || a.item.localeCompare(b.item);
      });
  }

  function selectedRecipeNamesForWeek() {
    const weekPlan = state.plan[state.activeWeek] || {};
    const names = new Set();
    for (const day of DAYS) {
      const dayPlan = weekPlan[day] || {};
      for (const slot of SLOTS) {
        if (dayPlan[slot.key]) names.add(dayPlan[slot.key]);
      }
    }
    return [...names];
  }

  function mealScore(recipe) {
    const ingredients = recipe.ingredients || [];
    const total = ingredients.length || 0;
    const have = ingredients.filter((ingredient) => ingredientStatus(ingredient.item) === "Already have").length;
    return { total, have, score: total ? have / total : 0 };
  }

  function ingredientStatus(item) {
    return state.ingredients[item] || "Need to buy";
  }

  function statusClass(status) {
    if (status === "Already have") return "have";
    if (status === "Optional") return "optional";
    if (status === "Skip") return "skip";
    return "need";
  }

  function macroHtml(recipe) {
    const macros = [
      ["Cal", recipe.calories],
      ["Protein", recipe.protein_g == null ? null : `${recipe.protein_g}g`],
      ["Carbs", recipe.carbs_g == null ? null : `${recipe.carbs_g}g`],
      ["Fat", recipe.fat_g == null ? null : `${recipe.fat_g}g`]
    ].filter(([, value]) => value !== null && value !== "");
    if (!macros.length) return `<div class="macro-row"><span class="macro">Macros follow product instructions</span></div>`;
    return `<div class="macro-row">${macros.map(([label, value]) => `<span class="macro">${label}: ${escapeHtml(value)}</span>`).join("")}</div>`;
  }

  function sumMacros(meals) {
    return meals.reduce((total, recipe) => {
      total.calories += Number(recipe.calories) || 0;
      total.protein += Number(recipe.protein_g) || 0;
      total.carbs += Number(recipe.carbs_g) || 0;
      total.fat += Number(recipe.fat_g) || 0;
      return total;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }

  function macroSummary(macros) {
    if (!macros.calories && !macros.protein && !macros.carbs && !macros.fat) return "No meals chosen yet";
    return `${Math.round(macros.calories)} cal | Protein ${round(macros.protein)}g | Carbs ${round(macros.carbs)}g | Fat ${round(macros.fat)}g`;
  }

  function round(value) {
    return Math.round(value * 10) / 10;
  }

  function weeklyDailyPercent() {
    let ticked = 0;
    let possible = 0;
    for (const day of DAYS) {
      const current = state.daily[dailyKey(state.activeWeek, day)] || {};
      for (const check of DAILY_CHECKS) {
        possible += 1;
        if (current[check.key]) ticked += 1;
      }
    }
    return possible ? Math.round((ticked / possible) * 100) : 0;
  }

  function completedWorkoutDaysForWeek() {
    const phase = phaseForWeek(state.activeWeek);
    const days = ["Monday", "Wednesday", "Friday"];
    return days.filter((day) => {
      const workouts = DATA.workouts.filter((workout) => workout.phase === phase && workout.day === day);
      return workouts.length && workouts.every((workout) => state.workouts[workoutKey(workout)]);
    }).length;
  }

  function phaseForWeek(week) {
    if (week <= 2) return "Week 1-2";
    if (week <= 5) return "Week 3-5";
    return "Week 6-8";
  }

  function dailyKey(week, day) {
    return `${week}|${day}`;
  }

  function noteKey() {
    return dailyKey(state.activeWeek, state.todayDay);
  }

  function workoutKey(workout) {
    return `${workout.phase}|${workout.day}|${workout.exercise}`;
  }

  function ensurePlanDay(week, day) {
    state.plan[week] = state.plan[week] || {};
    state.plan[week][day] = state.plan[week][day] || {};
    for (const slot of SLOTS) {
      state.plan[week][day][slot.key] = state.plan[week][day][slot.key] || "";
    }
  }

  function groupBy(list, key) {
    return list.reduce((groups, item) => {
      const value = item[key];
      groups[value] = groups[value] || [];
      groups[value].push(item);
      return groups;
    }, {});
  }

  function copyShoppingList() {
    const items = aggregateShopping("selected").filter((item) => ingredientStatus(item.item) === "Need to buy");
    const text = items.length
      ? items.map((item) => `- ${item.item} (${item.category}) - ${item.amounts.join("; ")} - used in ${item.usedIn.join("; ")}`).join("\n")
      : "No selected shopping items yet.";

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast("Shopping list copied."));
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    toast("Shopping list copied.");
  }

  function printView(viewName) {
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("printing"));
    document.querySelector(`#view-${viewName}`).classList.add("printing");
    window.print();
    setTimeout(() => {
      document.querySelector(`#view-${viewName}`).classList.remove("printing");
    }, 500);
  }

  function toast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    setTimeout(() => elements.toast.classList.remove("show"), 2200);
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {
        // The dashboard still works if a browser blocks local service workers.
      });
    });
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}());
