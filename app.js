(function () {
  const DATA = window.NUTRI_SCULPT_DATA;
  const APP_VERSION = "20260707-11";
  const STORAGE_KEY = "nutriSculptDashboardState.v1";
  const CALORIE_TARGET = 1500;
  const DAYS = DATA.days;
  const STATUSES = ["Need to buy", "Already have", "Optional", "Skip"];
  const CATEGORY_ORDER = ["Protein", "Dairy", "Fruit and veg", "Carbs", "Sauces", "Pantry"];
  const NUTRITION_SOURCES = [
    "PDF ingredient list",
    "Product nutrition label",
    "MyFitnessPal verified entry",
    "Open Food Facts",
    "USDA FoodData Central",
    "Manual entry - needs review"
  ];
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

  const pdfRecipes = DATA.recipes.map((recipe, index) => ({
    ...recipe,
    id: slug(`pdf-${index}-${recipe.name}`),
    source: "PDF"
  }));
  let recipes = [];
  let recipeByName = new Map();
  let types = [];
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
    statTodayCalories: document.querySelector("#statTodayCalories"),
    todayTotals: document.querySelector("#todayTotals"),
    customIngredientName: document.querySelector("#customIngredientName"),
    customIngredientBrand: document.querySelector("#customIngredientBrand"),
    customIngredientAmount: document.querySelector("#customIngredientAmount"),
    customIngredientCategory: document.querySelector("#customIngredientCategory"),
    customIngredientCalories: document.querySelector("#customIngredientCalories"),
    customIngredientProtein: document.querySelector("#customIngredientProtein"),
    customIngredientCarbs: document.querySelector("#customIngredientCarbs"),
    customIngredientFat: document.querySelector("#customIngredientFat"),
    customIngredientFibre: document.querySelector("#customIngredientFibre"),
    customIngredientSource: document.querySelector("#customIngredientSource"),
    customIngredientSourceUrl: document.querySelector("#customIngredientSourceUrl"),
    customIngredientVerified: document.querySelector("#customIngredientVerified"),
    saveCustomIngredient: document.querySelector("#saveCustomIngredient"),
    customProductName: document.querySelector("#customProductName"),
    customProductBrand: document.querySelector("#customProductBrand"),
    customProductBarcode: document.querySelector("#customProductBarcode"),
    customProductAmount: document.querySelector("#customProductAmount"),
    customProductType: document.querySelector("#customProductType"),
    customProductCategory: document.querySelector("#customProductCategory"),
    customProductCalories: document.querySelector("#customProductCalories"),
    customProductProtein: document.querySelector("#customProductProtein"),
    customProductCarbs: document.querySelector("#customProductCarbs"),
    customProductFat: document.querySelector("#customProductFat"),
    customProductFibre: document.querySelector("#customProductFibre"),
    customProductSource: document.querySelector("#customProductSource"),
    customProductSourceUrl: document.querySelector("#customProductSourceUrl"),
    customProductVerified: document.querySelector("#customProductVerified"),
    saveCustomProduct: document.querySelector("#saveCustomProduct"),
    findProductNutrition: document.querySelector("#findProductNutrition"),
    usdaApiKey: document.querySelector("#usdaApiKey"),
    saveUsdaApiKey: document.querySelector("#saveUsdaApiKey"),
    lookupStatus: document.querySelector("#lookupStatus"),
    lookupResults: document.querySelector("#lookupResults"),
    ingredientOptions: document.querySelector("#ingredientOptions"),
    customIngredientBank: document.querySelector("#customIngredientBank"),
    labelPhoto: document.querySelector("#labelPhoto"),
    labelPreview: document.querySelector("#labelPreview"),
    readLabelPhoto: document.querySelector("#readLabelPhoto"),
    labelReadStatus: document.querySelector("#labelReadStatus"),
    labelOcrText: document.querySelector("#labelOcrText"),
    useLabelForIngredient: document.querySelector("#useLabelForIngredient"),
    useLabelForProduct: document.querySelector("#useLabelForProduct"),
    manualServingSize: document.querySelector("#manualServingSize"),
    manualEnergyKj: document.querySelector("#manualEnergyKj"),
    manualCalories: document.querySelector("#manualCalories"),
    manualProtein: document.querySelector("#manualProtein"),
    manualCarbs: document.querySelector("#manualCarbs"),
    manualFat: document.querySelector("#manualFat"),
    manualFibre: document.querySelector("#manualFibre"),
    useManualLabelValues: document.querySelector("#useManualLabelValues"),
    useManualLabelForProduct: document.querySelector("#useManualLabelForProduct"),
    customMealName: document.querySelector("#customMealName"),
    customMealType: document.querySelector("#customMealType"),
    customMealNotes: document.querySelector("#customMealNotes"),
    pdfSwapMeal: document.querySelector("#pdfSwapMeal"),
    startSwapMeal: document.querySelector("#startSwapMeal"),
    pdfSwapReference: document.querySelector("#pdfSwapReference"),
    mealIngredientName: document.querySelector("#mealIngredientName"),
    mealIngredientAmount: document.querySelector("#mealIngredientAmount"),
    mealIngredientCategory: document.querySelector("#mealIngredientCategory"),
    mealIngredientCalories: document.querySelector("#mealIngredientCalories"),
    mealIngredientProtein: document.querySelector("#mealIngredientProtein"),
    mealIngredientCarbs: document.querySelector("#mealIngredientCarbs"),
    mealIngredientFat: document.querySelector("#mealIngredientFat"),
    mealIngredientFibre: document.querySelector("#mealIngredientFibre"),
    mealIngredientSource: document.querySelector("#mealIngredientSource"),
    addMealIngredient: document.querySelector("#addMealIngredient"),
    customMealBuilderList: document.querySelector("#customMealBuilderList"),
    customMealTotals: document.querySelector("#customMealTotals"),
    saveCustomMeal: document.querySelector("#saveCustomMeal"),
    clearCustomMeal: document.querySelector("#clearCustomMeal"),
    customProductsList: document.querySelector("#customProductsList"),
    customMealsList: document.querySelector("#customMealsList"),
    toast: document.querySelector("#toast")
  };

  let state = loadState();
  updateRecipeIndexes();

  window.nutriSculptPickMeal = handlePlanSlotChange;
  initialiseControls();
  attachEvents();
  registerServiceWorker();
  renderAll();
  showAppVersion();

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function updateRecipeIndexes() {
    const customProducts = (state.customProducts || []).map((product, index) => normaliseCustomProduct(product, index));
    const customRecipes = (state.customMeals || []).map((meal, index) => normaliseCustomMeal(meal, index));
    recipes = [...pdfRecipes, ...customProducts, ...customRecipes];
    recipeByName = new Map(recipes.map((recipe) => [recipe.name, recipe]));
    types = [...new Set(recipes.map((recipe) => recipe.type))];
  }

  function normaliseCustomProduct(product, index) {
    const name = product.name || product.item || `Custom product ${index + 1}`;
    const amount = product.amount || product.servingSize || "1 serving";
    return {
      id: product.id || slug(`product-${index}-${name}`),
      name,
      type: product.type && product.type !== "Auto" ? product.type : inferProductType(name),
      servings: amount,
      calories: Number(product.calories) || 0,
      protein_g: Number(product.protein_g) || 0,
      carbs_g: Number(product.carbs_g) || 0,
      fat_g: Number(product.fat_g) || 0,
      fibre_g: Number(product.fibre_g) || 0,
      ingredients: [{
        item: name,
        amount,
        category: productCategory(product),
        calories: Number(product.calories) || 0,
        protein_g: Number(product.protein_g) || 0,
        carbs_g: Number(product.carbs_g) || 0,
        fat_g: Number(product.fat_g) || 0,
        fibre_g: Number(product.fibre_g) || 0,
        source: product.source || "Manual entry - needs review"
      }],
      notes: product.brand
        ? `${product.brand} product. Values are per ${amount}.`
        : `Custom product. Values are per ${amount}.`,
      source: "Product"
    };
  }

  function normaliseCustomMeal(meal, index) {
    const ingredients = Array.isArray(meal.ingredients) ? meal.ingredients : [];
    const totals = sumIngredientMacros(ingredients);
    return {
      id: meal.id || slug(`custom-${index}-${meal.name}`),
      name: meal.name,
      type: meal.type || "Lunch or Dinner",
      servings: meal.servings || "1",
      calories: totals.calories,
      protein_g: totals.protein,
      carbs_g: totals.carbs,
      fat_g: totals.fat,
      fibre_g: totals.fibre,
      ingredients,
      notes: meal.notes || "Custom meal. Nutrition depends on the confirmed ingredients.",
      source: "Custom"
    };
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
      photoChecks: {},
      customIngredients: [],
      customProducts: [],
      customMeals: [],
      customMealDraft: [],
      nutritionLookup: {
        usdaApiKey: "",
        results: [],
        status: "Search by product name, brand, or barcode. Open Food Facts works without a key; USDA needs a free API key saved in this browser.",
        statusType: "neutral"
      },
      labelScan: {
        photo: "",
        text: "",
        status: "Upload a clear photo or type the per-serving values below.",
        statusType: "neutral"
      }
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
    const merged = {
      ...base,
      ...saved,
      plan: { ...base.plan, ...(saved.plan || {}) },
      ingredients: { ...base.ingredients, ...(saved.ingredients || {}) },
      daily: { ...base.daily, ...(saved.daily || {}) },
      notes: { ...base.notes, ...(saved.notes || {}) },
      workouts: { ...base.workouts, ...(saved.workouts || {}) },
      measurements: { ...base.measurements, ...(saved.measurements || {}) },
      reflections: { ...base.reflections, ...(saved.reflections || {}) },
      photoChecks: { ...base.photoChecks, ...(saved.photoChecks || {}) },
      customIngredients: Array.isArray(saved.customIngredients) ? saved.customIngredients : [],
      customProducts: Array.isArray(saved.customProducts) ? saved.customProducts : [],
      customMeals: Array.isArray(saved.customMeals) ? saved.customMeals : [],
      customMealDraft: Array.isArray(saved.customMealDraft) ? saved.customMealDraft : [],
      nutritionLookup: { ...base.nutritionLookup, ...(saved.nutritionLookup || {}), results: Array.isArray(saved.nutritionLookup?.results) ? saved.nutritionLookup.results : [] },
      labelScan: { ...base.labelScan, ...(saved.labelScan || {}) }
    };
    cleanupBrokenPlanSlots(merged.plan);
    return merged;
  }

  function cleanupBrokenPlanSlots(plan) {
    Object.values(plan || {}).forEach((weekPlan) => {
      Object.values(weekPlan || {}).forEach((dayPlan) => {
        if (dayPlan && Object.prototype.hasOwnProperty.call(dayPlan, "undefined")) {
          delete dayPlan.undefined;
        }
      });
    });
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
    if (elements.customIngredientCategory) {
      elements.customIngredientCategory.innerHTML = CATEGORY_ORDER.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
    }
    if (elements.customProductCategory) {
      elements.customProductCategory.innerHTML = ["Auto", ...CATEGORY_ORDER].map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
    }
    if (elements.mealIngredientCategory) {
      elements.mealIngredientCategory.innerHTML = CATEGORY_ORDER.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
    }
    if (elements.customIngredientSource) {
      elements.customIngredientSource.innerHTML = NUTRITION_SOURCES.map((source) => `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`).join("");
    }
    if (elements.customProductSource) {
      elements.customProductSource.innerHTML = NUTRITION_SOURCES.filter((source) => source !== "PDF ingredient list").map((source) => `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`).join("");
    }
    if (elements.mealIngredientSource) {
      elements.mealIngredientSource.innerHTML = NUTRITION_SOURCES.map((source) => `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`).join("");
    }
    if (elements.customProductType) {
      elements.customProductType.innerHTML = ["Auto", ...SLOTS.flatMap((slot) => slot.types).filter((type, index, list) => list.indexOf(type) === index)].map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("");
    }
    if (elements.customMealType) {
      elements.customMealType.innerHTML = SLOTS.flatMap((slot) => slot.types).filter((type, index, list) => list.indexOf(type) === index).map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("");
    }
    if (elements.pdfSwapMeal) {
      elements.pdfSwapMeal.innerHTML = `<option value="">Choose PDF meal</option>${pdfRecipes.map((recipe) => `<option value="${escapeHtml(recipe.name)}">${escapeHtml(recipe.name)}</option>`).join("")}`;
    }

    elements.activeWeek.value = state.activeWeek;
    elements.todayDay.value = state.todayDay;
    elements.mealSearch.value = state.mealSearch;
    elements.mealTypeFilter.value = state.mealTypeFilter;
    elements.sortMeals.value = state.sortMeals;
    elements.showAllShopping.checked = state.showAllShopping;
    elements.workoutPhase.value = state.workoutPhase;
    if (elements.usdaApiKey) elements.usdaApiKey.value = state.nutritionLookup?.usdaApiKey || "";
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

    document.querySelector("#updateApp").addEventListener("click", () => {
      updateAppFiles();
    });

    document.querySelector("#printToday").addEventListener("click", () => printView("today"));
    document.querySelector("#printWeek").addEventListener("click", () => printView("week"));
    document.querySelector("#printShopping").addEventListener("click", () => printView("shopping"));
    document.querySelector("#copyShopping").addEventListener("click", copyShoppingList);
    elements.saveCustomIngredient?.addEventListener("click", saveCustomIngredientFromForm);
    elements.saveCustomProduct?.addEventListener("click", saveCustomProductFromForm);
    elements.findProductNutrition?.addEventListener("click", findProductNutrition);
    elements.saveUsdaApiKey?.addEventListener("click", saveUsdaApiKey);
    elements.labelPhoto?.addEventListener("change", handleLabelPhotoChange);
    elements.readLabelPhoto?.addEventListener("click", readLabelPhoto);
    elements.useLabelForIngredient?.addEventListener("click", useLabelForIngredient);
    elements.useLabelForProduct?.addEventListener("click", useLabelForProduct);
    elements.useManualLabelValues?.addEventListener("click", useManualLabelValues);
    elements.useManualLabelForProduct?.addEventListener("click", useManualLabelValuesForProduct);
    elements.manualEnergyKj?.addEventListener("input", updateManualCaloriesFromKj);
    elements.pdfSwapMeal?.addEventListener("change", () => saveAndRender(["custom"]));
    elements.startSwapMeal?.addEventListener("click", startSwapMealFromPdf);
    elements.addMealIngredient?.addEventListener("click", addIngredientToCustomMealDraft);
    elements.saveCustomMeal?.addEventListener("click", saveCustomMealFromDraft);
    elements.clearCustomMeal?.addEventListener("click", clearCustomMealDraft);

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

      if (target.matches("[data-meal-draft-macro]")) {
        updateDraftIngredient(target.dataset.mealDraftMacro, target.dataset.field, target.value);
      }
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (target.matches("[data-remove-draft-ingredient]")) {
        removeDraftIngredient(target.dataset.removeDraftIngredient);
      }

      if (target.matches("[data-delete-custom-meal]")) {
        deleteCustomMeal(target.dataset.deleteCustomMeal);
      }

      if (target.matches("[data-delete-custom-ingredient]")) {
        deleteCustomIngredient(target.dataset.deleteCustomIngredient);
      }

      if (target.matches("[data-use-custom-ingredient]")) {
        fillMealIngredientFromBank(target.dataset.useCustomIngredient);
      }

      if (target.matches("[data-delete-custom-product]")) {
        deleteCustomProduct(target.dataset.deleteCustomProduct);
      }

      if (target.matches("[data-use-custom-product]")) {
        fillMealIngredientFromProduct(target.dataset.useCustomProduct);
      }

      if (target.matches("[data-use-lookup-result]")) {
        applyLookupResult(Number(target.dataset.useLookupResult));
      }
    });
  }

  function handlePlanSlotChange(target) {
    const day = target.dataset.day;
    const slot = target.dataset.planSlot;
    if (!day || !slot) return;
    ensurePlanDay(state.activeWeek, day);
    const changed = state.plan[state.activeWeek][day][slot] !== target.value;
    state.plan[state.activeWeek][day][slot] = target.value;
    const recipe = recipeByName.get(target.value);
    saveAndRender(["today", "week", "shopping", "meals", "stats"]);
    if (recipe && changed) {
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
    if (everything || parts.includes("custom")) renderCustom();
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
          <div>${recipe ? mealNameWithSource(recipe) : "Choose in This Week"}</div>
          ${recipe ? macroHtml(recipe) : ""}
        </article>
      `;
    }).join("");
    if (elements.todayTotals) {
      elements.todayTotals.innerHTML = dailyTotalsHtml(day);
    }

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
          <div class="day-macros ${calorieStatusClass(macros.calories)}">${macroSummary(macros)} | ${calorieRemainingText(macros.calories)}</div>
        </article>
      `;
    }).join("");
  }

  function mealSelectHtml(day, slot, selected) {
    const selectedRecipe = recipeByName.get(selected);
    const options = recipes
      .filter((recipe) => slot.types.includes(recipe.type))
      .map((recipe) => `<option value="${escapeHtml(recipe.name)}" ${recipe.name === selected ? "selected" : ""}>${escapeHtml(recipe.name)}${recipe.source === "Custom" ? " (Custom)" : recipe.source === "Product" ? " (Product)" : ""}</option>`)
      .join("");
    return `
      <div class="meal-slot">
        <label>${escapeHtml(slot.label)}</label>
        <select class="field" data-plan-slot="${slot.key}" data-day="${escapeHtml(day)}" onchange="window.nutriSculptPickMeal(this)" oninput="window.nutriSculptPickMeal(this)">
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
        <strong>${mealNameWithSource(recipe)}</strong>
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
          <span class="type-badge">${escapeHtml(recipe.source === "Custom" ? "Custom" : recipe.source === "Product" ? "Product" : recipe.type)}</span>
        </div>
        ${recipe.source === "Custom" ? `<p class="item-meta">User-added meal. Source values come from confirmed ingredients.</p>` : ""}
        ${recipe.source === "Product" ? `<p class="item-meta">User-added product. Values are counted as one selected serving.</p>` : ""}
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

  function renderCustom() {
    if (!elements.customIngredientBank) return;
    elements.ingredientOptions.innerHTML = allKnownIngredients()
      .map((ingredient) => `<option value="${escapeHtml(ingredient.item)}"></option>`)
      .join("");
    elements.customIngredientBank.innerHTML = customIngredientBankHtml();
    if (elements.customProductsList) {
      elements.customProductsList.innerHTML = customProductsListHtml();
    }
    elements.customMealBuilderList.innerHTML = customMealDraftHtml();
    elements.customMealTotals.innerHTML = customMealTotalsHtml(state.customMealDraft || []);
    elements.customMealsList.innerHTML = customMealsListHtml();
    if (elements.pdfSwapReference) {
      elements.pdfSwapReference.innerHTML = pdfSwapReferenceHtml();
    }
    if (elements.lookupStatus) {
      elements.lookupStatus.textContent = state.nutritionLookup?.status || "";
      elements.lookupStatus.className = `label-status ${state.nutritionLookup?.statusType || "neutral"}`;
    }
    if (elements.lookupResults) {
      elements.lookupResults.innerHTML = lookupResultsHtml();
    }
    if (elements.labelPreview) {
      elements.labelPreview.src = state.labelScan.photo || "";
      elements.labelPreview.hidden = !state.labelScan.photo;
    }
    if (elements.labelOcrText && elements.labelOcrText.value !== state.labelScan.text) {
      elements.labelOcrText.value = state.labelScan.text || "";
    }
    if (elements.labelReadStatus) {
      elements.labelReadStatus.textContent = state.labelScan.status || "Upload a clear photo or type the per-serving values below.";
      elements.labelReadStatus.className = `label-status ${state.labelScan.statusType || "neutral"}`;
    }
  }

  function customIngredientBankHtml() {
    const custom = state.customIngredients || [];
    if (!custom.length) {
      return `<div class="empty-panel">No custom ingredients saved yet.</div>`;
    }
    return custom.map((ingredient) => `
      <article class="custom-list-item">
        <div>
          <strong>${escapeHtml(ingredient.item)}</strong>
          <div class="item-meta">${escapeHtml(ingredient.amount || "serving")} | ${nutritionLine(ingredient)}</div>
          <div class="item-meta">${escapeHtml(ingredient.source || "Manual entry - needs review")}${ingredient.verified ? " | confirmed" : " | needs review"}</div>
        </div>
        <div class="custom-actions">
          <button class="ghost-button small-button" type="button" data-use-custom-ingredient="${escapeHtml(ingredient.id)}">Use</button>
          <button class="ghost-button small-button" type="button" data-delete-custom-ingredient="${escapeHtml(ingredient.id)}">Delete</button>
        </div>
      </article>
    `).join("");
  }

  function customProductsListHtml() {
    const products = state.customProducts || [];
    if (!products.length) {
      return `<div class="empty-panel">No custom products saved yet. Add products like Futurelife, yoghurt cups, bars, or ready portions here.</div>`;
    }
    return products.map((product) => {
      const recipe = normaliseCustomProduct(product, 0);
      return `
        <article class="custom-list-item">
          <div>
            <strong>${escapeHtml(recipe.name)}</strong>
            <div class="item-meta">${escapeHtml(product.brand || "No brand")} | ${escapeHtml(recipe.type)} | ${nutritionLine(recipe)}</div>
            <div class="item-meta">${escapeHtml(product.source || "Manual entry - needs review")}${product.verified ? " | confirmed" : " | needs review"}</div>
          </div>
          <div class="custom-actions">
            <button class="ghost-button small-button" type="button" data-use-custom-product="${escapeHtml(product.id)}">Use in meal</button>
            <button class="ghost-button small-button" type="button" data-delete-custom-product="${escapeHtml(product.id)}">Delete</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function lookupResultsHtml() {
    const results = state.nutritionLookup?.results || [];
    if (!results.length) {
      return `<div class="empty-panel">Search results will appear here. Pick a result to fill the product form, then press Save product.</div>`;
    }
    return results.map((result, index) => `
      <article class="lookup-result ${index === 0 ? "recommended-result" : ""}">
        <div>
          <strong>${escapeHtml(result.name)}${index === 0 ? ` <span class="source-badge">Recommended</span>` : ""}</strong>
          <div class="item-meta">${escapeHtml(result.brand || "No brand")} | ${escapeHtml(result.amount || "100 g")} | ${escapeHtml(result.source)}</div>
          <div class="item-meta">${nutritionLine(result)}</div>
          <div class="lookup-confidence ${escapeHtml(result.confidence || "review")}">${escapeHtml(result.confidenceLabel || "Review")} confidence: ${escapeHtml(result.confidenceReason || "check serving size")}</div>
        </div>
        <button class="primary-button small-button" type="button" data-use-lookup-result="${index}">Use values</button>
      </article>
    `).join("");
  }

  function customMealDraftHtml() {
    const draft = state.customMealDraft || [];
    if (!draft.length) {
      return `<div class="empty-panel">No ingredients in this custom meal yet.</div>`;
    }
    return draft.map((ingredient) => `
      <article class="draft-ingredient">
        <div>
          <strong>${escapeHtml(ingredient.item)}</strong>
          <div class="item-meta">${escapeHtml(ingredient.amount || "serving")} | ${escapeHtml(ingredient.source || "Manual entry - needs review")}</div>
        </div>
        <div class="macro-edit-grid">
          ${macroEditInput(ingredient.id, "calories", "Cal", ingredient.calories)}
          ${macroEditInput(ingredient.id, "protein_g", "Protein", ingredient.protein_g)}
          ${macroEditInput(ingredient.id, "carbs_g", "Carbs", ingredient.carbs_g)}
          ${macroEditInput(ingredient.id, "fat_g", "Fat", ingredient.fat_g)}
          ${macroEditInput(ingredient.id, "fibre_g", "Fibre", ingredient.fibre_g)}
        </div>
        <button class="ghost-button small-button" type="button" data-remove-draft-ingredient="${escapeHtml(ingredient.id)}">Remove</button>
      </article>
    `).join("");
  }

  function macroEditInput(id, field, label, value) {
    return `
      <label>
        <span>${escapeHtml(label)}</span>
        <input class="field mini-field" type="number" min="0" step="0.1" value="${escapeHtml(value ?? "")}" data-meal-draft-macro="${escapeHtml(id)}" data-field="${escapeHtml(field)}">
      </label>
    `;
  }

  function customMealTotalsHtml(ingredients) {
    const totals = sumIngredientMacros(ingredients);
    return `
      <div class="target-card ${calorieStatusClass(totals.calories)}">
        <strong>Custom meal total</strong>
        <span>${macroSummary(totals)}</span>
      </div>
    `;
  }

  function pdfSwapReferenceHtml() {
    const recipe = pdfRecipes.find((item) => item.name === valueOf(elements.pdfSwapMeal));
    if (!recipe) {
      return `<div class="empty-panel">Choose a PDF meal to see its original total and ingredient list.</div>`;
    }
    return `
      <div class="swap-reference">
        <div>
          <strong>${escapeHtml(recipe.name)}</strong>
          <div class="item-meta">Original PDF total: ${nutritionLine(recipe)}</div>
        </div>
        <div class="info-band compact-info">The PDF gives this meal as one total, not per ingredient. For swaps, build the actual meal from products/ingredients she ate.</div>
        <ul class="ingredients swap-ingredients">
          ${(recipe.ingredients || []).map((ingredient) => `<li><span><strong>${escapeHtml(ingredient.item)}</strong><br><span class="item-meta">${escapeHtml(ingredient.amount || "")}</span></span></li>`).join("")}
        </ul>
      </div>
    `;
  }

  function customMealsListHtml() {
    const meals = state.customMeals || [];
    if (!meals.length) {
      return `<div class="empty-panel">No custom meals saved yet.</div>`;
    }
    return meals.map((meal) => {
      const recipe = normaliseCustomMeal(meal, 0);
      return `
        <article class="custom-list-item">
          <div>
            <strong>${escapeHtml(recipe.name)}</strong>
            <div class="item-meta">${escapeHtml(recipe.type)} | ${nutritionLine(recipe)}</div>
            <div class="item-meta">${escapeHtml((recipe.ingredients || []).map((ingredient) => ingredient.item).join(", "))}</div>
          </div>
          <button class="ghost-button small-button" type="button" data-delete-custom-meal="${escapeHtml(meal.id)}">Delete</button>
        </article>
      `;
    }).join("");
  }

  function saveCustomIngredientFromForm() {
    const ingredient = readIngredientForm("custom");
    if (!ingredient.item) {
      toast("Add an ingredient name first.");
      return;
    }
    if (!hasMacroValues(ingredient)) {
      toast("Add calories or macros before saving.");
      return;
    }
    const existing = (state.customIngredients || []).findIndex((item) => item.item.toLowerCase() === ingredient.item.toLowerCase());
    if (existing >= 0) {
      state.customIngredients[existing] = { ...state.customIngredients[existing], ...ingredient, id: state.customIngredients[existing].id };
    } else {
      state.customIngredients.push({ ...ingredient, id: uniqueId("ingredient") });
    }
    clearCustomIngredientForm();
    saveAndRender(["custom"]);
    toast("Ingredient saved.");
  }

  function saveCustomProductFromForm() {
    const product = readProductForm();
    if (!product.name) {
      toast("Add a product name first.");
      return;
    }
    if (!hasMacroValues(product)) {
      toast("Add calories or macros before saving the product.");
      return;
    }

    const existing = (state.customProducts || []).findIndex((item) => item.name.toLowerCase() === product.name.toLowerCase());
    if (existing >= 0) {
      state.customProducts[existing] = { ...state.customProducts[existing], ...product, id: state.customProducts[existing].id };
    } else {
      const safeProduct = { ...product };
      if (recipeByName.has(safeProduct.name)) {
        safeProduct.name = uniqueProductName(safeProduct.name);
      }
      state.customProducts.push({ ...safeProduct, id: uniqueId("product") });
    }
    clearCustomProductForm();
    updateRecipeIndexes();
    initialiseControls();
    saveAndRender();
    toast(`${product.name} saved. It is now available in This Week.`);
  }

  function readProductForm() {
    const name = valueOf(elements.customProductName);
    const selectedType = valueOf(elements.customProductType);
    const selectedCategory = valueOf(elements.customProductCategory);
    return {
      name,
      brand: valueOf(elements.customProductBrand),
      barcode: valueOf(elements.customProductBarcode),
      amount: valueOf(elements.customProductAmount),
      type: selectedType && selectedType !== "Auto" ? selectedType : inferProductType(name),
      category: selectedCategory && selectedCategory !== "Auto" ? selectedCategory : inferProductCategory(name),
      calories: numberOf(elements.customProductCalories),
      protein_g: numberOf(elements.customProductProtein),
      carbs_g: numberOf(elements.customProductCarbs),
      fat_g: numberOf(elements.customProductFat),
      fibre_g: numberOf(elements.customProductFibre),
      source: valueOf(elements.customProductSource) || "Manual entry - needs review",
      sourceUrl: valueOf(elements.customProductSourceUrl),
      verified: Boolean(elements.customProductVerified?.checked)
    };
  }

  function fillProductForm(product) {
    if (!product) return;
    elements.customProductName.value = product.name || product.item || "";
    elements.customProductBrand.value = product.brand || "";
    elements.customProductBarcode.value = product.barcode || "";
    elements.customProductAmount.value = product.amount || product.servingSize || "";
    elements.customProductType.value = product.type && product.type !== "Auto" ? product.type : inferProductType(product.name || product.item);
    elements.customProductCategory.value = product.category && product.category !== "Auto" ? product.category : inferProductCategory(product.name || product.item);
    elements.customProductCalories.value = product.calories ?? "";
    elements.customProductProtein.value = product.protein_g ?? "";
    elements.customProductCarbs.value = product.carbs_g ?? "";
    elements.customProductFat.value = product.fat_g ?? "";
    elements.customProductFibre.value = product.fibre_g ?? "";
    elements.customProductSource.value = product.source || "Manual entry - needs review";
    elements.customProductSourceUrl.value = product.sourceUrl || product.url || "";
    elements.customProductVerified.checked = Boolean(product.verified);
  }

  function clearCustomProductForm() {
    [
      elements.customProductName,
      elements.customProductBrand,
      elements.customProductBarcode,
      elements.customProductAmount,
      elements.customProductCalories,
      elements.customProductProtein,
      elements.customProductCarbs,
      elements.customProductFat,
      elements.customProductFibre,
      elements.customProductSourceUrl
    ].forEach((input) => {
      if (input) input.value = "";
    });
    if (elements.customProductType) elements.customProductType.value = "Auto";
    if (elements.customProductCategory) elements.customProductCategory.value = "Auto";
    if (elements.customProductSource) elements.customProductSource.value = "Manual entry - needs review";
    if (elements.customProductVerified) elements.customProductVerified.checked = false;
  }

  function deleteCustomProduct(id) {
    const product = (state.customProducts || []).find((item) => item.id === id);
    state.customProducts = (state.customProducts || []).filter((item) => item.id !== id);
    if (product) removeMealFromPlans(product.name);
    updateRecipeIndexes();
    initialiseControls();
    saveAndRender();
    toast("Custom product deleted.");
  }

  function fillMealIngredientFromProduct(id) {
    const product = (state.customProducts || []).find((item) => item.id === id);
    if (!product) return;
    fillMealIngredientFields(productToIngredient(product));
    toast("Product ready to add to a custom meal.");
  }

  function saveUsdaApiKey() {
    state.nutritionLookup.usdaApiKey = valueOf(elements.usdaApiKey);
    const message = state.nutritionLookup.usdaApiKey
      ? "USDA search enabled on this browser."
      : "USDA key cleared. Open Food Facts will still work.";
    setNutritionLookupStatus(message, state.nutritionLookup.usdaApiKey ? "success" : "neutral");
    saveAndRender(["custom"]);
    toast(message);
  }

  async function findProductNutrition() {
    const product = readProductForm();
    const query = [product.name, product.brand].filter(Boolean).join(" ").trim();
    const barcode = product.barcode.replace(/\s+/g, "");
    if (!query && !barcode) {
      toast("Type a product name or barcode first.");
      return;
    }

    state.nutritionLookup.results = [];
    setNutritionLookupStatus("Searching nutrition sources...", "neutral");
    renderCustom();
    elements.findProductNutrition.disabled = true;
    elements.findProductNutrition.textContent = "Searching...";

    const messages = [];
    const localResults = searchSavedNutrition(query, barcode);
    const searches = [searchOpenFoodFacts(query, barcode)];
    const usdaKey = state.nutritionLookup.usdaApiKey || valueOf(elements.usdaApiKey);
    if (query && usdaKey) {
      searches.push(searchUsdaFoods(query, usdaKey));
    } else if (query) {
      messages.push("USDA not searched because no API key is saved.");
    }

    try {
      const settled = await Promise.allSettled(searches);
      const remoteResults = settled.flatMap((item) => item.status === "fulfilled" ? item.value : []);
      const failures = settled.filter((item) => item.status === "rejected").length;
      if (failures) messages.push(`${failures} source could not be reached.`);

      state.nutritionLookup.results = rankLookupResults(dedupeLookupResults([...localResults, ...remoteResults]), product, barcode).slice(0, 8);
      if (state.nutritionLookup.results.length) {
        const best = state.nutritionLookup.results[0];
        messages.unshift(`${best.confidenceLabel || "Recommended"} match found first. Check serving size, then use values or save product.`);
        messages.push("MyFitnessPal official API is not connected, so it is not searched automatically.");
        setNutritionLookupStatus(messages.join(" "), "success");
      } else {
        messages.unshift("No reliable nutrition match found. Try a barcode, a more exact brand name, USDA key, or the product label photo.");
        messages.push("MyFitnessPal official API is not connected, so it is not searched automatically.");
        setNutritionLookupStatus(messages.join(" "), "warning");
      }
    } catch {
      setNutritionLookupStatus("Nutrition sources could not be searched right now. You can still use the product label photo or manual values.", "warning");
    } finally {
      elements.findProductNutrition.disabled = false;
      elements.findProductNutrition.textContent = "Run safe lookup";
      saveAndRender(["custom"]);
    }
  }

  async function searchOpenFoodFacts(query, barcode) {
    const products = [];
    if (barcode) {
      const barcodeUrl = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}?fields=product_name,brands,quantity,serving_size,nutriments,code`;
      const barcodeJson = await fetchJson(barcodeUrl);
      if (barcodeJson?.status === 1 && barcodeJson.product) products.push({ ...barcodeJson.product, _matchBy: "barcode" });
    }
    if (query) {
      const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,brands,quantity,serving_size,nutriments,code`;
      const searchJson = await fetchJson(searchUrl);
      products.push(...(searchJson?.products || []).map((product) => ({ ...product, _matchBy: "name" })));
    }
    return products.map(productFromOpenFoodFacts).filter(Boolean);
  }

  async function searchUsdaFoods(query, apiKey) {
    const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("query", query);
    url.searchParams.set("pageSize", "5");
    const json = await fetchJson(url.toString());
    return (json?.foods || []).map(productFromUsdaFood).filter(Boolean);
  }

  async function fetchJson(url) {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Nutrition lookup failed: ${response.status}`);
    return response.json();
  }

  function productFromOpenFoodFacts(product) {
    const name = String(product.product_name || "").trim();
    if (!name) return null;
    const amount = product.serving_size || "100 g";
    const nutriments = product.nutriments || {};
    const result = {
      name,
      brand: product.brands || "",
      barcode: product.code || "",
      amount,
      type: inferProductType(name),
      category: inferProductCategory(name),
      calories: caloriesFromNutriments(nutriments, amount),
      protein_g: nutrientFromNutriments(nutriments, ["proteins"], amount),
      carbs_g: nutrientFromNutriments(nutriments, ["carbohydrates"], amount),
      fat_g: nutrientFromNutriments(nutriments, ["fat"], amount),
      fibre_g: nutrientFromNutriments(nutriments, ["fiber", "fibre"], amount),
      source: "Open Food Facts",
      sourceUrl: product.code ? `https://world.openfoodfacts.org/product/${encodeURIComponent(product.code)}` : "https://world.openfoodfacts.org",
      matchBy: product._matchBy || "name",
      verified: true
    };
    return hasMacroValues(result) ? result : null;
  }

  function productFromUsdaFood(food) {
    const name = String(food.description || "").trim();
    if (!name) return null;
    const calories = usdaNutrient(food, /energy/i, "KCAL")
      || Math.round((usdaNutrient(food, /energy/i, "KJ") || 0) / 4.184);
    const result = {
      name,
      brand: food.brandOwner || food.brandName || "",
      barcode: "",
      amount: "100 g",
      type: inferProductType(name),
      category: inferProductCategory(name),
      calories,
      protein_g: usdaNutrient(food, /^protein$/i),
      carbs_g: usdaNutrient(food, /carbohydrate/i),
      fat_g: usdaNutrient(food, /total lipid|fat/i),
      fibre_g: usdaNutrient(food, /fiber|fibre/i),
      source: "USDA FoodData Central",
      sourceUrl: food.fdcId ? `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${food.fdcId}/nutrients` : "https://fdc.nal.usda.gov",
      matchBy: "name",
      verified: true
    };
    return hasMacroValues(result) ? result : null;
  }

  function searchSavedNutrition(query, barcode) {
    const saved = [
      ...(state.customProducts || []).map((product) => ({
        ...product,
        source: product.source || "Saved product",
        matchBy: "saved",
        sourceUrl: product.sourceUrl || ""
      })),
      ...(state.customIngredients || []).map((ingredient) => ({
        name: ingredient.item,
        brand: ingredient.brand || "",
        barcode: "",
        amount: ingredient.amount,
        type: inferProductType(ingredient.item),
        category: ingredient.category || inferProductCategory(ingredient.item),
        calories: ingredient.calories,
        protein_g: ingredient.protein_g,
        carbs_g: ingredient.carbs_g,
        fat_g: ingredient.fat_g,
        fibre_g: ingredient.fibre_g,
        source: ingredient.source || "Saved ingredient",
        sourceUrl: ingredient.sourceUrl || "",
        matchBy: "saved",
        verified: Boolean(ingredient.verified)
      }))
    ];

    const tokens = searchTokens(query);
    return saved.filter((item) => {
      if (barcode && item.barcode && item.barcode === barcode) return true;
      if (!tokens.length) return false;
      const text = `${item.name || item.item || ""} ${item.brand || ""}`.toLowerCase();
      return tokens.every((token) => text.includes(token));
    }).filter(hasMacroValues);
  }

  function rankLookupResults(results, requestedProduct, barcode) {
    return results
      .map((result) => withLookupConfidence(result, requestedProduct, barcode))
      .sort((a, b) => b.rankScore - a.rankScore || a.name.localeCompare(b.name));
  }

  function withLookupConfidence(result, requestedProduct, barcode) {
    let score = 0;
    const reasons = [];
    const queryTokens = searchTokens(`${requestedProduct.name || ""} ${requestedProduct.brand || ""}`);
    const resultText = `${result.name || ""} ${result.brand || ""}`.toLowerCase();
    const requestedBrand = String(requestedProduct.brand || "").trim().toLowerCase();

    if (result.matchBy === "saved") {
      score += 55;
      reasons.push("already saved in this app");
    }
    if (barcode && result.barcode && result.barcode === barcode) {
      score += 50;
      reasons.push("barcode match");
    } else if (result.matchBy === "barcode") {
      score += 45;
      reasons.push("barcode source match");
    }
    if (queryTokens.length) {
      const matched = queryTokens.filter((token) => resultText.includes(token)).length;
      score += Math.round((matched / queryTokens.length) * 30);
      if (matched) reasons.push(`${matched}/${queryTokens.length} name or brand words match`);
    }
    if (requestedBrand && String(result.brand || "").toLowerCase().includes(requestedBrand)) {
      score += 18;
      reasons.push("brand match");
    }
    if (result.source === "Open Food Facts") {
      score += 16;
      reasons.push("product database");
    }
    if (result.source === "USDA FoodData Central") {
      score += 10;
      reasons.push("generic USDA nutrition");
    }
    if (result.source === "Product nutrition label") {
      score += 35;
      reasons.push("product label values");
    }
    if (result.verified) score += 8;
    if (!servingGramsFromText(result.amount) && result.amount !== "100 g") score -= 8;

    const confidence = score >= 78 ? "high" : score >= 48 ? "medium" : "review";
    return {
      ...result,
      rankScore: score,
      confidence,
      confidenceLabel: confidence === "high" ? "High-confidence" : confidence === "medium" ? "Good" : "Review",
      confidenceReason: reasons.join("; ") || "check against the product label"
    };
  }

  function searchTokens(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 3)
      .filter((token, index, list) => list.indexOf(token) === index);
  }

  function usdaNutrient(food, namePattern, unitName) {
    const nutrient = (food.foodNutrients || []).find((item) => {
      const matchesName = namePattern.test(item.nutrientName || "");
      const matchesUnit = !unitName || String(item.unitName || "").toUpperCase() === unitName;
      return matchesName && matchesUnit;
    });
    return nutrient ? round(numberFromValue(nutrient.value)) : 0;
  }

  function caloriesFromNutriments(nutriments, amount) {
    const kcal = nutrientFromNutriments(nutriments, ["energy-kcal"], amount);
    if (kcal) return Math.round(kcal);
    const kj = nutrientFromNutriments(nutriments, ["energy-kj", "energy"], amount);
    return kj ? Math.round(kj / 4.184) : 0;
  }

  function nutrientFromNutriments(nutriments, keys, amount) {
    for (const key of keys) {
      const perServing = nutrimentNumber(nutriments, [`${key}_serving`, `${key}-serving`]);
      if (perServing != null) return round(perServing);
      const per100g = nutrimentNumber(nutriments, [`${key}_100g`, `${key}-100g`]);
      if (per100g != null) {
        const grams = servingGramsFromText(amount);
        return grams ? round((per100g * grams) / 100) : round(per100g);
      }
    }
    return 0;
  }

  function nutrimentNumber(nutriments, keys) {
    for (const key of keys) {
      const value = numberFromValue(nutriments[key]);
      if (Number.isFinite(value) && value > 0) return value;
    }
    return null;
  }

  function servingGramsFromText(text) {
    const match = String(text || "").match(/(\d+(?:[.,]\d+)?)\s*(g|gram|grams|ml|mℓ)/i);
    return match ? numberFromValue(match[1]) : 0;
  }

  function dedupeLookupResults(results) {
    const seen = new Set();
    return results.filter((result) => {
      const key = `${result.source}|${result.name}|${result.brand}|${result.amount}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return hasMacroValues(result);
    });
  }

  function applyLookupResult(index) {
    const result = state.nutritionLookup?.results?.[index];
    if (!result) return;
    fillProductForm(result);
    setNutritionLookupStatus("Values filled into the product form. Check the serving size, then press Save product.", "success");
    saveAndRender(["custom"]);
    toast("Product values filled.");
  }

  function setNutritionLookupStatus(message, type) {
    state.nutritionLookup = state.nutritionLookup || {};
    state.nutritionLookup.status = message;
    state.nutritionLookup.statusType = type || "neutral";
  }

  function readIngredientForm(prefix) {
    const isCustom = prefix === "custom";
    return {
      item: valueOf(isCustom ? elements.customIngredientName : elements.mealIngredientName),
      brand: valueOf(elements.customIngredientBrand),
      amount: valueOf(isCustom ? elements.customIngredientAmount : elements.mealIngredientAmount),
      category: valueOf(isCustom ? elements.customIngredientCategory : elements.mealIngredientCategory) || "Pantry",
      calories: numberOf(isCustom ? elements.customIngredientCalories : elements.mealIngredientCalories),
      protein_g: numberOf(isCustom ? elements.customIngredientProtein : elements.mealIngredientProtein),
      carbs_g: numberOf(isCustom ? elements.customIngredientCarbs : elements.mealIngredientCarbs),
      fat_g: numberOf(isCustom ? elements.customIngredientFat : elements.mealIngredientFat),
      fibre_g: numberOf(isCustom ? elements.customIngredientFibre : elements.mealIngredientFibre),
      source: valueOf(isCustom ? elements.customIngredientSource : elements.mealIngredientSource) || "Manual entry - needs review",
      sourceUrl: valueOf(elements.customIngredientSourceUrl),
      verified: isCustom ? Boolean(elements.customIngredientVerified?.checked) : true
    };
  }

  function addIngredientToCustomMealDraft() {
    const ingredient = readIngredientForm("meal");
    if (!ingredient.item) {
      toast("Choose or type an ingredient first.");
      return;
    }
    const bankIngredient = findKnownIngredient(ingredient.item);
    const draftIngredient = {
      ...bankIngredient,
      ...ingredient,
      category: ingredient.category || bankIngredient?.category || "Pantry",
      amount: ingredient.amount || bankIngredient?.amount || "",
      calories: ingredient.calories || bankIngredient?.calories || 0,
      protein_g: ingredient.protein_g || bankIngredient?.protein_g || 0,
      carbs_g: ingredient.carbs_g || bankIngredient?.carbs_g || 0,
      fat_g: ingredient.fat_g || bankIngredient?.fat_g || 0,
      fibre_g: ingredient.fibre_g || bankIngredient?.fibre_g || 0,
      source: ingredient.source || bankIngredient?.source || "Manual entry - needs review",
      id: uniqueId("draft")
    };
    state.customMealDraft.push(draftIngredient);
    clearMealIngredientForm();
    saveAndRender(["custom"]);
    toast("Ingredient added to custom meal.");
  }

  function saveCustomMealFromDraft() {
    const name = valueOf(elements.customMealName);
    if (!name) {
      toast("Add a custom meal name first.");
      return;
    }
    if (!state.customMealDraft.length) {
      toast("Add at least one ingredient.");
      return;
    }
    const safeName = uniqueMealName(name);
    const meal = {
      id: uniqueId("meal"),
      name: safeName,
      type: valueOf(elements.customMealType) || "Lunch or Dinner",
      servings: "1",
      notes: valueOf(elements.customMealNotes),
      ingredients: state.customMealDraft.map(({ id, ...ingredient }) => ingredient)
    };
    state.customMeals.push(meal);
    state.customMealDraft = [];
    elements.customMealName.value = "";
    elements.customMealNotes.value = "";
    updateRecipeIndexes();
    initialiseControls();
    saveAndRender();
    toast(`${safeName} saved. It is now in the planner.`);
  }

  function startSwapMealFromPdf() {
    const recipe = pdfRecipes.find((item) => item.name === valueOf(elements.pdfSwapMeal));
    if (!recipe) {
      toast("Choose the PDF meal first.");
      return;
    }
    if (state.customMealDraft.length && !confirm("Clear the current custom meal draft and start this swapped meal?")) {
      return;
    }
    state.customMealDraft = [];
    elements.customMealName.value = `${recipe.name} - actual version`;
    elements.customMealType.value = recipe.type || "Breakfast";
    elements.customMealNotes.value = `Started from PDF meal "${recipe.name}". Original PDF total was ${nutritionLine(recipe)}. Actual macros below come only from the products/ingredients added because the PDF does not split macros per component.`;
    saveAndRender(["custom"]);
    toast("Now add the products she actually ate, then save the custom meal.");
  }

  function updateDraftIngredient(id, field, value) {
    const ingredient = (state.customMealDraft || []).find((item) => item.id === id);
    if (!ingredient) return;
    ingredient[field] = numberFromValue(value);
    saveAndRender(["custom"]);
  }

  function removeDraftIngredient(id) {
    state.customMealDraft = (state.customMealDraft || []).filter((ingredient) => ingredient.id !== id);
    saveAndRender(["custom"]);
  }

  function clearCustomMealDraft() {
    state.customMealDraft = [];
    saveAndRender(["custom"]);
    toast("Custom meal draft cleared.");
  }

  function deleteCustomMeal(id) {
    const meal = (state.customMeals || []).find((item) => item.id === id);
    state.customMeals = (state.customMeals || []).filter((item) => item.id !== id);
    if (meal) removeMealFromPlans(meal.name);
    updateRecipeIndexes();
    initialiseControls();
    saveAndRender();
    toast("Custom meal deleted.");
  }

  function deleteCustomIngredient(id) {
    state.customIngredients = (state.customIngredients || []).filter((ingredient) => ingredient.id !== id);
    saveAndRender(["custom"]);
    toast("Custom ingredient deleted.");
  }

  function fillMealIngredientFromBank(id) {
    const ingredient = (state.customIngredients || []).find((item) => item.id === id);
    if (!ingredient) return;
    fillMealIngredientFields(ingredient);
    toast("Ingredient ready to add.");
  }

  function handleLabelPhotoChange() {
    const file = elements.labelPhoto.files?.[0];
    if (!file) return;
    elements.labelPreview.src = URL.createObjectURL(file);
    elements.labelPreview.hidden = false;
    state.labelScan.photo = "";
    saveState();
  }

  async function readLabelPhoto() {
    const file = elements.labelPhoto.files?.[0];
    if (!file) {
      toast("Upload a nutrition label photo first.");
      return;
    }
    clearLabelReadValues();
    setLabelStatus("Reading label photo...", "neutral");
    elements.readLabelPhoto.disabled = true;
    elements.readLabelPhoto.textContent = "Reading...";
    try {
      await loadTesseract();
      const ocrImage = await prepareLabelImageForOcr(file);
      const result = await window.Tesseract.recognize(ocrImage, "eng", {
        tessedit_pageseg_mode: "6",
        preserve_interword_spaces: "1"
      });
      const rawText = result?.data?.text || "";
      state.labelScan.text = englishOnlyNutritionText(rawText);
      const parsed = parseNutritionText(rawText);
      if (hasEnoughParsedNutrition(parsed)) {
        applyParsedNutrition(parsed);
        fillManualLabelFields(parsed);
        setLabelStatus("Label read. Check the values, then save the ingredient.", "success");
      } else {
        setLabelStatus("Photo not clear enough to read values. Type the per-serving values from the label below.", "warning");
        clearLabelDerivedIngredientFields();
        toast("Photo not clear enough. Type the serving values below.");
      }
      saveAndRender(["custom"]);
      if (hasEnoughParsedNutrition(parsed)) toast("Label read. Please confirm the values.");
    } catch {
      setLabelStatus("Could not read this photo. Type the per-serving values from the label below.", "warning");
      toast("Could not read the photo. Type the label values manually.");
    } finally {
      elements.readLabelPhoto.disabled = false;
      elements.readLabelPhoto.textContent = "Read label";
    }
  }

  function useLabelForIngredient() {
    const text = elements.labelOcrText.value || "";
    state.labelScan.text = text;
    const parsed = parseNutritionText(text);
    if (!hasEnoughParsedNutrition(parsed)) {
      setLabelStatus("OCR text is not clear enough. Use the per-serving boxes instead.", "warning");
      saveAndRender(["custom"]);
      toast("OCR text is not clear enough.");
      return;
    }
    applyParsedNutrition(parsed);
    fillManualLabelFields(parsed);
    setLabelStatus("Values copied from OCR text. Please confirm before saving.", "success");
    saveAndRender(["custom"]);
    toast("Values copied into ingredient form for review.");
  }

  function useLabelForProduct() {
    const text = elements.labelOcrText.value || "";
    state.labelScan.text = text;
    const parsed = parseNutritionText(text);
    if (!hasEnoughParsedNutrition(parsed)) {
      setLabelStatus("OCR text is not clear enough. Use the per-serving boxes instead.", "warning");
      saveAndRender(["custom"]);
      toast("OCR text is not clear enough.");
      return;
    }
    applyParsedNutritionToProduct(parsed);
    fillManualLabelFields(parsed);
    setLabelStatus("Values copied into product form. Check the product name and serving size before saving.", "success");
    saveAndRender(["custom"]);
    toast("Values copied into product form for review.");
  }

  function useManualLabelValues() {
    const parsed = manualLabelParsedValues();
    if (!hasEnoughParsedNutrition(parsed)) {
      toast("Add at least calories or three macro values first.");
      return;
    }
    applyParsedNutrition(parsed);
    setLabelStatus("Manual values copied. Please confirm before saving.", "success");
    saveAndRender(["custom"]);
    toast("Manual label values copied. Please confirm before saving.");
  }

  function useManualLabelValuesForProduct() {
    const parsed = manualLabelParsedValues();
    if (!hasEnoughParsedNutrition(parsed)) {
      toast("Add at least calories or three macro values first.");
      return;
    }
    applyParsedNutritionToProduct(parsed);
    setLabelStatus("Manual values copied into product form. Check the product name before saving.", "success");
    saveAndRender(["custom"]);
    toast("Manual label values copied into product form.");
  }

  function manualLabelParsedValues() {
    const calories = numberOf(elements.manualCalories) || kjToCalories(numberOf(elements.manualEnergyKj));
    return {
      servingSize: valueOf(elements.manualServingSize),
      calories,
      protein_g: numberOf(elements.manualProtein),
      carbs_g: numberOf(elements.manualCarbs),
      fat_g: numberOf(elements.manualFat),
      fibre_g: numberOf(elements.manualFibre),
      sourceNote: "English per-serving values typed from product nutrition label."
    };
  }

  function updateManualCaloriesFromKj() {
    if (!elements.manualCalories) return;
    const kj = numberOf(elements.manualEnergyKj);
    elements.manualCalories.value = kj > 0 ? kjToCalories(kj) : "";
  }

  function fillManualLabelFields(parsed) {
    if (!parsed) return;
    if (parsed.servingSize && !valueOf(elements.manualServingSize)) elements.manualServingSize.value = parsed.servingSize;
    if (parsed.calories != null && !valueOf(elements.manualCalories)) elements.manualCalories.value = parsed.calories;
    if (parsed.protein_g != null && !valueOf(elements.manualProtein)) elements.manualProtein.value = parsed.protein_g;
    if (parsed.carbs_g != null && !valueOf(elements.manualCarbs)) elements.manualCarbs.value = parsed.carbs_g;
    if (parsed.fat_g != null && !valueOf(elements.manualFat)) elements.manualFat.value = parsed.fat_g;
    if (parsed.fibre_g != null && !valueOf(elements.manualFibre)) elements.manualFibre.value = parsed.fibre_g;
  }

  function kjToCalories(kj) {
    return kj > 0 ? Math.round(kj / 4.184) : 0;
  }

  function setLabelStatus(message, type) {
    state.labelScan.status = message;
    state.labelScan.statusType = type;
    if (elements.labelReadStatus) {
      elements.labelReadStatus.textContent = message;
      elements.labelReadStatus.className = `label-status ${type || "neutral"}`;
    }
  }

  function clearLabelReadValues() {
    state.labelScan.text = "";
    clearManualLabelFields();
    clearLabelDerivedIngredientFields();
    if (elements.labelOcrText) elements.labelOcrText.value = "";
  }

  function clearManualLabelFields() {
    [
      elements.manualServingSize,
      elements.manualEnergyKj,
      elements.manualCalories,
      elements.manualProtein,
      elements.manualCarbs,
      elements.manualFat,
      elements.manualFibre
    ].forEach((input) => {
      if (input) input.value = "";
    });
  }

  function clearLabelDerivedIngredientFields() {
    [
      elements.customIngredientAmount,
      elements.customIngredientCalories,
      elements.customIngredientProtein,
      elements.customIngredientCarbs,
      elements.customIngredientFat,
      elements.customIngredientFibre
    ].forEach((input) => {
      if (input) input.value = "";
    });
    if (elements.customIngredientSourceUrl && /English rows only|product nutrition label|nutrition column/i.test(elements.customIngredientSourceUrl.value)) {
      elements.customIngredientSourceUrl.value = "";
    }
    if (elements.customIngredientVerified) elements.customIngredientVerified.checked = false;
  }

  function hasEnoughParsedNutrition(parsed) {
    if (!parsed) return false;
    const coreFields = ["calories", "protein_g", "carbs_g", "fat_g", "fibre_g"];
    const filled = coreFields.filter((field) => parsed[field] != null && parsed[field] !== "").length;
    return Boolean(parsed.calories) || filled >= 3;
  }

  function applyParsedNutrition(parsed) {
    if (!parsed) return;
    if (parsed.servingSize && !elements.customIngredientAmount.value) {
      elements.customIngredientAmount.value = parsed.servingSize;
    }
    if (parsed.calories != null) elements.customIngredientCalories.value = parsed.calories;
    if (parsed.protein_g != null) elements.customIngredientProtein.value = parsed.protein_g;
    if (parsed.carbs_g != null) elements.customIngredientCarbs.value = parsed.carbs_g;
    if (parsed.fat_g != null) elements.customIngredientFat.value = parsed.fat_g;
    if (parsed.fibre_g != null) elements.customIngredientFibre.value = parsed.fibre_g;
    elements.customIngredientSource.value = "Product nutrition label";
    if (parsed.sourceNote && !elements.customIngredientSourceUrl.value) {
      elements.customIngredientSourceUrl.value = parsed.sourceNote;
    }
    elements.customIngredientVerified.checked = false;
  }

  function applyParsedNutritionToProduct(parsed) {
    if (!parsed) return;
    if (parsed.servingSize && !elements.customProductAmount.value) {
      elements.customProductAmount.value = parsed.servingSize;
    }
    if (parsed.calories != null) elements.customProductCalories.value = parsed.calories;
    if (parsed.protein_g != null) elements.customProductProtein.value = parsed.protein_g;
    if (parsed.carbs_g != null) elements.customProductCarbs.value = parsed.carbs_g;
    if (parsed.fat_g != null) elements.customProductFat.value = parsed.fat_g;
    if (parsed.fibre_g != null) elements.customProductFibre.value = parsed.fibre_g;
    elements.customProductSource.value = "Product nutrition label";
    if (parsed.sourceNote && !elements.customProductSourceUrl.value) {
      elements.customProductSourceUrl.value = parsed.sourceNote;
    }
    elements.customProductVerified.checked = false;
  }

  function parseNutritionText(text) {
    const cleanText = englishOnlyNutritionText(text);
    const lines = cleanText.split(/\n|;/).map((line) => line.trim()).filter(Boolean);
    const joined = lines.join("\n");
    const servingSize = extractServingSize(joined);
    const preferredColumn = preferredNutritionColumn(joined);
    const parsed = { servingSize };

    for (const line of lines) {
      const label = nutritionLabelForLine(line);
      if (!label || /per\s+100|%|nrv|vitamins?/i.test(label)) continue;

      if (/^energy\b/.test(label)) {
        parsed.calories = energyCaloriesFromLine(line, preferredColumn);
      } else if (/^protein\b/.test(label)) {
        parsed.protein_g = selectedNutrientValue(line, preferredColumn);
      } else if (/^(glycaemic\s+)?carbohydrate\b|^carbs\b/.test(label)) {
        parsed.carbs_g = selectedNutrientValue(line, preferredColumn);
      } else if (/^(total\s+)?fat\b/.test(label) && !/saturated|trans|polyunsaturated|monounsaturated|omega/i.test(label)) {
        parsed.fat_g = selectedNutrientValue(line, preferredColumn);
      } else if (/^(dietary\s+)?fib(?:re|er)\b/.test(label)) {
        parsed.fibre_g = selectedNutrientValue(line, preferredColumn);
      }
    }

    if (servingSize) {
      parsed.sourceNote = `English rows only; values copied from ${preferredColumn === 1 ? "per-serving" : "first"} nutrition column (${servingSize}).`;
    } else {
      parsed.sourceNote = `English rows only; values copied from ${preferredColumn === 1 ? "per-serving" : "first"} nutrition column.`;
    }
    return parsed;
  }

  function englishOnlyNutritionText(text) {
    return String(text || "")
      .replace(/,/g, ".")
      .split(/\n|;/)
      .map((line) => englishOnlyNutritionLine(line))
      .filter(Boolean)
      .join("\n");
  }

  function englishOnlyNutritionLine(line) {
    const cleaned = String(line || "").replace(/\s+/g, " ").trim();
    if (!cleaned) return "";
    const firstUnit = cleaned.search(/\b(?:kj|kcal|calories|g|mg|µg|ug)\b|\d/i);
    if (firstUnit < 0) return cleaned.split("/")[0].trim();
    const labelPart = cleaned.slice(0, firstUnit).trim();
    const valuePart = cleaned.slice(firstUnit).trim();
    const englishLabel = labelPart.includes("/") ? labelPart.split("/")[0].trim() : labelPart;
    return `${englishLabel} ${valuePart}`.replace(/\s+/g, " ").trim();
  }

  function nutritionLabelForLine(line) {
    const beforeValues = String(line || "").split(/\b(?:kj|kcal|calories|g|mg|µg|ug)\b|\d/i)[0] || "";
    return beforeValues
      .replace(/[^a-z\s-]/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function extractServingSize(text) {
    const serving = String(text || "").match(/serving\s+size\s*(\d+(?:\.\d+)?)\s*(g|ml|mℓ|oz|cup|cups|slice|slices|serving)/i)
      || String(text || "").match(/per\s*(\d+(?:\.\d+)?)\s*(g|ml|mℓ|oz|cup|cups|slice|slices)\s*(?:serving)?/i);
    return serving ? `${numberFromValue(serving[1])} ${serving[2].replace("mℓ", "ml")}` : "";
  }

  function preferredNutritionColumn(text) {
    const hasPer100 = /(?:per\s*)?100\s*(?:g|ml|mℓ)/i.test(text);
    const hasServingColumn = /(?:per\s*)?(?!100\b)\d+(?:\.\d+)?\s*(?:g|ml|mℓ|oz|cup|cups|slice|slices)\s*(?:serving)/i.test(text)
      || /per\s+serving/i.test(text);
    const hasServingSize = /serving\s+size\s*\d+(?:\.\d+)?\s*(?:g|ml|mℓ|oz|cup|cups|slice|slices)/i.test(text);
    return hasPer100 && (hasServingColumn || hasServingSize) ? 1 : 0;
  }

  function energyCaloriesFromLine(line, preferredColumn) {
    const lower = String(line || "").toLowerCase();
    if (lower.includes("kcal") || lower.includes("calories")) {
      const kcalStart = lower.includes("kcal") ? lower.indexOf("kcal") : lower.indexOf("calories");
      const kcalValues = nutritionNumbers(line.slice(kcalStart));
      const kcal = pickColumnValue(kcalValues, preferredColumn);
      if (kcal != null) return Math.round(kcal);
    }
    const energy = selectedNutrientValue(line, preferredColumn);
    if (energy == null) return null;
    return lower.includes("kj") ? Math.round(energy / 4.184) : Math.round(energy);
  }

  function selectedNutrientValue(line, preferredColumn) {
    const values = nutritionNumbers(line);
    const value = pickColumnValue(values, preferredColumn);
    return value == null ? null : round(value);
  }

  function pickColumnValue(values, preferredColumn) {
    if (!values.length) return null;
    if (preferredColumn === 1 && values.length > 1) return values[1];
    return values[0];
  }

  function nutritionNumbers(line) {
    return String(line || "")
      .replace(/\b(\d{1,2})\s+(\d{3})(?=\D|$)/g, "$1$2")
      .match(/\d+(?:\.\d+)?/g)?.map(numberFromValue) || [];
  }

  function parseNutritionTextLegacy(text) {
    const lines = String(text || "").replace(/,/g, ".").split(/\n|;/).map((line) => line.trim()).filter(Boolean);
    const joined = lines.join("\n");
    return {
      calories: parseFirstNumber(joined, /(?:calories|kcal)[^\d]*(\d+(?:\.\d+)?)/i)
        ?? parseFirstNumber(joined, /energy[^\n]*?(\d+(?:\.\d+)?)\s*kcal/i)
        ?? parseFirstNumber(joined, /energy[^\d]*(\d+(?:\.\d+)?)/i),
      protein_g: parseFirstNumber(joined, /protein[^\d]*(\d+(?:\.\d+)?)/i),
      carbs_g: parseFirstNumber(joined, /(?:carbohydrate|carbs)[^\d]*(\d+(?:\.\d+)?)/i),
      fat_g: parseFirstNumber(joined, /(?:total\s+fat|fat)[^\d]*(\d+(?:\.\d+)?)/i),
      fibre_g: parseFirstNumber(joined, /(?:fibre|fiber)[^\d]*(\d+(?:\.\d+)?)/i)
    };
  }

  function prepareLabelImageForOcr(file) {
    return new Promise((resolve) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.addEventListener("load", () => {
        const scale = Math.max(1, Math.min(2, 1800 / Math.max(1, image.width)));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        for (let index = 0; index < pixels.length; index += 4) {
          const grey = pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114;
          const contrast = Math.max(0, Math.min(255, (grey - 128) * 1.7 + 128));
          pixels[index] = contrast;
          pixels[index + 1] = contrast;
          pixels[index + 2] = contrast;
        }
        context.putImageData(imageData, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => resolve(blob || file), "image/png");
      });
      image.addEventListener("error", () => {
        URL.revokeObjectURL(url);
        resolve(file);
      });
      image.src = url;
    });
  }

  function parseFirstNumber(text, pattern) {
    const match = String(text || "").match(pattern);
    return match ? numberFromValue(match[1]) : null;
  }

  function loadTesseract() {
    if (window.Tesseract) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
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
    const todayTotals = sumMacros(selectedMealsForDay(state.todayDay));

    const customCount = (state.customProducts?.length || 0) + (state.customMeals?.length || 0);
    elements.statMeals.textContent = `${pdfRecipes.length}${customCount ? ` + ${customCount}` : ""}`;
    elements.statShopping.textContent = needCount;
    elements.statRules.textContent = `${dailyPercent}%`;
    elements.statWorkouts.textContent = `${workoutCount}/3`;
    if (elements.statTodayCalories) {
      elements.statTodayCalories.textContent = `${Math.round(todayTotals.calories)}/${CALORIE_TARGET}`;
    }
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

  function selectedMealsForDay(day) {
    ensurePlanDay(state.activeWeek, day);
    const dayPlan = state.plan[state.activeWeek][day] || {};
    return SLOTS.map((slot) => recipeByName.get(dayPlan[slot.key])).filter(Boolean);
  }

  function dailyTotalsHtml(day) {
    const totals = sumMacros(selectedMealsForDay(day));
    return `
      <div class="target-card ${calorieStatusClass(totals.calories)}">
        <div>
          <span class="stat-label">Daily target</span>
          <strong>${Math.round(totals.calories)} / ${CALORIE_TARGET} cal</strong>
        </div>
        <div class="target-meter" aria-hidden="true"><span style="width:${Math.min(100, Math.round((totals.calories / CALORIE_TARGET) * 100))}%"></span></div>
        <div class="macro-row">
          <span class="macro">${calorieRemainingText(totals.calories)}</span>
          <span class="macro">Protein: ${round(totals.protein)}g</span>
          <span class="macro">Carbs: ${round(totals.carbs)}g</span>
          <span class="macro">Fat: ${round(totals.fat)}g</span>
          <span class="macro">Fibre: ${round(totals.fibre || 0)}g</span>
        </div>
      </div>
    `;
  }

  function allKnownIngredients() {
    const map = new Map();
    for (const recipe of pdfRecipes) {
      for (const ingredient of recipe.ingredients || []) {
        if (!map.has(ingredient.item)) {
          map.set(ingredient.item, {
            ...ingredient,
            source: "PDF ingredient list"
          });
        }
      }
    }
    for (const ingredient of state.customIngredients || []) {
      map.set(ingredient.item, ingredient);
    }
    for (const product of state.customProducts || []) {
      const ingredient = productToIngredient(product);
      map.set(ingredient.item, ingredient);
    }
    return [...map.values()].sort((a, b) => a.item.localeCompare(b.item));
  }

  function findKnownIngredient(name) {
    return allKnownIngredients().find((ingredient) => ingredient.item.toLowerCase() === String(name || "").toLowerCase()) || null;
  }

  function sumIngredientMacros(ingredients) {
    return (ingredients || []).reduce((total, ingredient) => {
      total.calories += Number(ingredient.calories) || 0;
      total.protein += Number(ingredient.protein_g) || 0;
      total.carbs += Number(ingredient.carbs_g) || 0;
      total.fat += Number(ingredient.fat_g) || 0;
      total.fibre += Number(ingredient.fibre_g) || 0;
      return total;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 });
  }

  function nutritionLine(item) {
    const parts = [
      `Cal ${Math.round(Number(item.calories) || 0)}`,
      `Protein ${round(Number(item.protein_g) || 0)}g`,
      `Carbs ${round(Number(item.carbs_g) || 0)}g`,
      `Fat ${round(Number(item.fat_g) || 0)}g`
    ];
    if (Number(item.fibre_g)) parts.push(`Fibre ${round(Number(item.fibre_g))}g`);
    return parts.join(" | ");
  }

  function calorieStatusClass(calories) {
    const value = Number(calories) || 0;
    if (value > CALORIE_TARGET) return "over-target";
    if (value >= CALORIE_TARGET * 0.9) return "near-target";
    return "within-target";
  }

  function calorieRemainingText(calories) {
    const remaining = CALORIE_TARGET - (Number(calories) || 0);
    if (remaining < 0) return `${Math.abs(Math.round(remaining))} cal over target`;
    return `${Math.round(remaining)} cal remaining`;
  }

  function mealNameWithSource(recipe) {
    const badge = recipe.source === "Custom" || recipe.source === "Product"
      ? ` <span class="source-badge">${escapeHtml(recipe.source)}</span>`
      : "";
    return `${escapeHtml(recipe.name)}${badge}`;
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
      ["Fat", recipe.fat_g == null ? null : `${recipe.fat_g}g`],
      ["Fibre", recipe.fibre_g == null ? null : `${recipe.fibre_g}g`]
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
      total.fibre += Number(recipe.fibre_g) || 0;
      return total;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 });
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

  function removeMealFromPlans(name) {
    for (const weekPlan of Object.values(state.plan || {})) {
      for (const dayPlan of Object.values(weekPlan || {})) {
        for (const slot of SLOTS) {
          if (dayPlan[slot.key] === name) dayPlan[slot.key] = "";
        }
      }
    }
  }

  function uniqueMealName(name) {
    const trimmed = name.trim();
    if (!recipeByName.has(trimmed)) return trimmed;
    let candidate = `${trimmed} - custom version`;
    let index = 2;
    while (recipeByName.has(candidate)) {
      candidate = `${trimmed} - custom version ${index}`;
      index += 1;
    }
    return candidate;
  }

  function uniqueProductName(name) {
    const trimmed = name.trim();
    if (!recipeByName.has(trimmed)) return trimmed;
    let candidate = `${trimmed} - product`;
    let index = 2;
    while (recipeByName.has(candidate)) {
      candidate = `${trimmed} - product ${index}`;
      index += 1;
    }
    return candidate;
  }

  function productToIngredient(product) {
    return {
      item: product.name || product.item || "",
      brand: product.brand || "",
      amount: product.amount || product.servingSize || "1 serving",
      category: productCategory(product),
      calories: Number(product.calories) || 0,
      protein_g: Number(product.protein_g) || 0,
      carbs_g: Number(product.carbs_g) || 0,
      fat_g: Number(product.fat_g) || 0,
      fibre_g: Number(product.fibre_g) || 0,
      source: product.source || "Manual entry - needs review",
      sourceUrl: product.sourceUrl || "",
      verified: Boolean(product.verified)
    };
  }

  function inferProductType(name) {
    const text = String(name || "").toLowerCase();
    if (/porridge|oats|cereal|future\s*life|futurelife|muesli|granola|weet-?bix|breakfast/.test(text)) return "Breakfast";
    if (/yoghurt|yogurt|protein|biltong|egg|cheese|cottage|tuna|chicken/.test(text)) return "High Protein Snack";
    if (/bar|fruit|cracker|rice cake|popcorn|snack/.test(text)) return "Carb Snack";
    if (/meal|wrap|soup|salad|bowl|pasta|rice/.test(text)) return "Lunch or Dinner";
    return "Breakfast";
  }

  function inferProductCategory(name) {
    const text = String(name || "").toLowerCase();
    if (/yoghurt|yogurt|milk|cheese|cottage/.test(text)) return "Dairy";
    if (/chicken|beef|biltong|egg|tuna|fish|protein/.test(text)) return "Protein";
    if (/porridge|oats|cereal|future\s*life|futurelife|muesli|granola|bread|wrap|rice|pasta|cracker|bar|cake/.test(text)) return "Carbs";
    if (/fruit|apple|banana|berry|vegetable|veg|salad/.test(text)) return "Fruit and veg";
    if (/sauce|dressing|mayo|mayonnaise/.test(text)) return "Sauces";
    return "Pantry";
  }

  function productCategory(product) {
    const name = product.name || product.item || "";
    const inferred = inferProductCategory(name);
    if (inferred === "Carbs" && product.category === "Fruit and veg") return "Carbs";
    return product.category && product.category !== "Auto" ? product.category : inferred;
  }

  function hasMacroValues(ingredient) {
    return ["calories", "protein_g", "carbs_g", "fat_g", "fibre_g"].some((field) => Number(ingredient[field]) > 0);
  }

  function fillMealIngredientFields(ingredient) {
    elements.mealIngredientName.value = ingredient.item || "";
    elements.mealIngredientAmount.value = ingredient.amount || "";
    elements.mealIngredientCategory.value = ingredient.category || "Pantry";
    elements.mealIngredientCalories.value = ingredient.calories ?? "";
    elements.mealIngredientProtein.value = ingredient.protein_g ?? "";
    elements.mealIngredientCarbs.value = ingredient.carbs_g ?? "";
    elements.mealIngredientFat.value = ingredient.fat_g ?? "";
    elements.mealIngredientFibre.value = ingredient.fibre_g ?? "";
    elements.mealIngredientSource.value = ingredient.source || "Manual entry - needs review";
  }

  function clearCustomIngredientForm() {
    [
      elements.customIngredientName,
      elements.customIngredientBrand,
      elements.customIngredientAmount,
      elements.customIngredientCalories,
      elements.customIngredientProtein,
      elements.customIngredientCarbs,
      elements.customIngredientFat,
      elements.customIngredientFibre,
      elements.customIngredientSourceUrl
    ].forEach((input) => {
      if (input) input.value = "";
    });
    if (elements.customIngredientVerified) elements.customIngredientVerified.checked = false;
  }

  function clearMealIngredientForm() {
    [
      elements.mealIngredientName,
      elements.mealIngredientAmount,
      elements.mealIngredientCalories,
      elements.mealIngredientProtein,
      elements.mealIngredientCarbs,
      elements.mealIngredientFat,
      elements.mealIngredientFibre
    ].forEach((input) => {
      if (input) input.value = "";
    });
  }

  function valueOf(element) {
    return String(element?.value || "").trim();
  }

  function numberOf(element) {
    return numberFromValue(element?.value);
  }

  function numberFromValue(value) {
    const normalised = String(value ?? "").replace(",", ".");
    const parsed = Number.parseFloat(normalised);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function uniqueId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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
      navigator.serviceWorker.register(`./service-worker.js?v=${APP_VERSION}`).catch(() => {
        // The dashboard still works if a browser blocks local service workers.
      });
    });
  }

  async function updateAppFiles() {
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } finally {
      const base = window.location.pathname || "./index.html";
      window.location.href = `${base}?v=${APP_VERSION}-${Date.now()}`;
    }
  }

  function showAppVersion() {
    const header = document.querySelector(".header-actions");
    if (!header) return;
    const version = document.createElement("span");
    version.className = "app-version";
    version.textContent = `App v${APP_VERSION}`;
    header.appendChild(version);
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
