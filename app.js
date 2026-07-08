(function () {
  const DATA = window.NUTRI_SCULPT_DATA;
  const APP_VERSION = "20260708-29";
  const STORAGE_KEY = "nutriSculptDashboardState.v1";
  const MEMBER_CONFIG = window.NUTRI_MEMBER_CONFIG || {};
  const DEFAULT_MACRO_TARGETS = {
    calories: 1500,
    protein: 100,
    carbs: 120,
    fat: 50,
    fibre: 25
  };
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
    { key: "proteinSnack", label: "High Protein Snack", types: ["High Protein Snack"] },
    { key: "other", label: "Other", types: ["Other"], allowAll: true }
  ];
  const DAILY_CHECKS = [
    { key: "water", label: "I drank 2-3 L water" },
    { key: "proteinMoreThanCarbs", label: "I prioritised protein today" },
    { key: "noSugaryDrinks", label: "I avoided sugary drinks" },
    { key: "noSweets", label: "I stayed within my treat plan" },
    { key: "avoidedFastFood", label: "I followed my planned meals" },
    { key: "highProteinSnack", label: "I had a high-protein snack" },
    { key: "active", label: "I moved my body" },
    { key: "alcoholLimited", label: "I limited/avoided alcohol" },
    { key: "mealTimes", label: "I kept meal times consistent" },
    { key: "prepAhead", label: "I planned ahead" }
  ];

  const pdfRecipes = DATA.recipes.map((recipe, index) => ({
    ...recipe,
    id: slug(`pdf-${index}-${recipe.name}`),
    source: "PDF"
  }));
  let recipes = [];
  let mealRecipes = [];
  let recipeByName = new Map();
  let types = [];
  const workoutPhases = [...new Set(DATA.workouts.map((workout) => workout.phase))];

  const elements = {
    activeWeek: document.querySelector("#activeWeek"),
    exportState: document.querySelector("#exportState"),
    copyStateText: document.querySelector("#copyStateText"),
    importState: document.querySelector("#importState"),
    pasteStateText: document.querySelector("#pasteStateText"),
    importStateFile: document.querySelector("#importStateFile"),
    installApp: document.querySelector("#installApp"),
    installStatus: document.querySelector("#installStatus"),
    installSteps: document.querySelector("#installSteps"),
    moveDataSteps: document.querySelector("#moveDataSteps"),
    updateNotice: document.querySelector("#updateNotice"),
    updateNoticeText: document.querySelector("#updateNoticeText"),
    updateNow: document.querySelector("#updateNow"),
    updateLater: document.querySelector("#updateLater"),
    memberGate: document.querySelector("#memberGate"),
    memberGateText: document.querySelector("#memberGateText"),
    memberAuthPanel: document.querySelector("#memberAuthPanel"),
    memberLockedPanel: document.querySelector("#memberLockedPanel"),
    memberLockedTitle: document.querySelector("#memberLockedTitle"),
    memberLockedText: document.querySelector("#memberLockedText"),
    memberEmail: document.querySelector("#memberEmail"),
    memberPassword: document.querySelector("#memberPassword"),
    memberSignIn: document.querySelector("#memberSignIn"),
    memberSignUp: document.querySelector("#memberSignUp"),
    memberSubscribe: document.querySelector("#memberSubscribe"),
    memberCheckAccess: document.querySelector("#memberCheckAccess"),
    memberSignOut: document.querySelector("#memberSignOut"),
    headerMemberSignOut: document.querySelector("#headerMemberSignOut"),
    memberAccessStatus: document.querySelector("#memberAccessStatus"),
    memberBadge: document.querySelector("#memberBadge"),
    shareImportPanel: document.querySelector("#shareImportPanel"),
    shareImportText: document.querySelector("#shareImportText"),
    importPastedState: document.querySelector("#importPastedState"),
    clearShareImport: document.querySelector("#clearShareImport"),
    todayDay: document.querySelector("#todayDay"),
    todayHeading: document.querySelector("#todayHeading"),
    todayTitle: document.querySelector("#todayTitle"),
    todayMeals: document.querySelector("#todayMeals"),
    todaySundayMessage: document.querySelector("#todaySundayMessage"),
    todayWorkout: document.querySelector("#todayWorkout"),
    planNext3Days: document.querySelector("#planNext3Days"),
    todayNotes: document.querySelector("#todayNotes"),
    dailyChecks: document.querySelector("#dailyChecks"),
    weekGrid: document.querySelector("#weekGrid"),
    weekSummary: document.querySelector("#weekSummary"),
    mealSearch: document.querySelector("#mealSearch"),
    mealTypeFilter: document.querySelector("#mealTypeFilter"),
    sortMeals: document.querySelector("#sortMeals"),
    mealCards: document.querySelector("#mealCards"),
    showAllShopping: document.querySelector("#showAllShopping"),
    shoppingRange: document.querySelector("#shoppingRange"),
    startShoppingTrip: document.querySelector("#startShoppingTrip"),
    exitShoppingTrip: document.querySelector("#exitShoppingTrip"),
    toggleBoughtItems: document.querySelector("#toggleBoughtItems"),
    shoppingModeIntro: document.querySelector("#shoppingModeIntro"),
    shoppingList: document.querySelector("#shoppingList"),
    workoutPhase: document.querySelector("#workoutPhase"),
    workoutSummary: document.querySelector("#workoutSummary"),
    workoutGrid: document.querySelector("#workoutGrid"),
    measurementTable: document.querySelector("#measurementTable"),
    photoGuidelines: document.querySelector("#photoGuidelines"),
    weeklyReflection: document.querySelector("#weeklyReflection"),
    coachNotes: document.querySelector("#coachNotes"),
    rulesList: document.querySelector("#rulesList"),
    instructionsList: document.querySelector("#instructionsList"),
    statMeals: document.querySelector("#statMeals"),
    statShopping: document.querySelector("#statShopping"),
    statRules: document.querySelector("#statRules"),
    statWorkouts: document.querySelector("#statWorkouts"),
    statTodayCalories: document.querySelector("#statTodayCalories"),
    todayTotals: document.querySelector("#todayTotals"),
    targetCalories: document.querySelector("#targetCalories"),
    targetProtein: document.querySelector("#targetProtein"),
    targetCarbs: document.querySelector("#targetCarbs"),
    targetFat: document.querySelector("#targetFat"),
    targetFibre: document.querySelector("#targetFibre"),
    resetMacroTargets: document.querySelector("#resetMacroTargets"),
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
    clearCustomIngredient: document.querySelector("#clearCustomIngredient"),
    findIngredientNutrition: document.querySelector("#findIngredientNutrition"),
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
    clearCustomProduct: document.querySelector("#clearCustomProduct"),
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
    clearLabelPhoto: document.querySelector("#clearLabelPhoto"),
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
    customMealServings: document.querySelector("#customMealServings"),
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
    clearMealIngredient: document.querySelector("#clearMealIngredient"),
    customMealBuilderList: document.querySelector("#customMealBuilderList"),
    customMealTotals: document.querySelector("#customMealTotals"),
    saveCustomMeal: document.querySelector("#saveCustomMeal"),
    clearCustomMeal: document.querySelector("#clearCustomMeal"),
    customProductsList: document.querySelector("#customProductsList"),
    customMealsList: document.querySelector("#customMealsList"),
    toast: document.querySelector("#toast")
  };

  let state = loadState();
  let editingCustomIngredientId = "";
  let editingCustomProductId = "";
  let editingCustomMealId = "";
  let deferredInstallPrompt = null;
  let availableAppVersion = "";
  let memberClient = null;
  let currentMemberUser = null;
  updateRecipeIndexes();

  window.nutriSculptPickMeal = handlePlanSlotChange;
  initialiseControls();
  attachEvents();
  registerServiceWorker();
  setupInstallAndUpdateHelpers();
  setupMemberAccess();
  renderAll();
  showAppVersion();

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function updateRecipeIndexes() {
    const customIngredients = (state.customIngredients || []).map((ingredient, index) => normaliseCustomIngredient(ingredient, index));
    const customProducts = (state.customProducts || []).map((product, index) => normaliseCustomProduct(product, index));
    const customRecipes = (state.customMeals || []).map((meal, index) => normaliseCustomMeal(meal, index));
    mealRecipes = [...pdfRecipes, ...customRecipes];
    recipes = [...pdfRecipes, ...customIngredients, ...customProducts, ...customRecipes];
    recipeByName = new Map(recipes.map((recipe) => [recipe.name, recipe]));
    types = [...new Set(mealRecipes.map((recipe) => recipe.type))];
  }

  function normaliseCustomIngredient(ingredient, index) {
    const name = ingredient.item || ingredient.name || `Custom ingredient ${index + 1}`;
    const amount = ingredient.amount || "1 serving";
    return {
      id: ingredient.id || slug(`ingredient-${index}-${name}`),
      name,
      type: "Other",
      servings: amount,
      calories: Number(ingredient.calories) || 0,
      protein_g: Number(ingredient.protein_g) || 0,
      carbs_g: Number(ingredient.carbs_g) || 0,
      fat_g: Number(ingredient.fat_g) || 0,
      fibre_g: Number(ingredient.fibre_g) || 0,
      ingredients: [{
        item: name,
        amount,
        category: ingredient.category || "Pantry",
        calories: Number(ingredient.calories) || 0,
        protein_g: Number(ingredient.protein_g) || 0,
        carbs_g: Number(ingredient.carbs_g) || 0,
        fat_g: Number(ingredient.fat_g) || 0,
        fibre_g: Number(ingredient.fibre_g) || 0,
        source: ingredient.source || "Manual entry - needs review"
      }],
      notes: `Custom ingredient. Values are per ${amount}.`,
      source: "Ingredient"
    };
  }

  function normaliseCustomProduct(product, index) {
    const name = product.name || product.item || `Custom product ${index + 1}`;
    const amount = product.amount || product.servings || product.servingSize || "1 serving";
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
      shoppingRange: "next3",
      shoppingMode: false,
      showBought: true,
      shoppingBought: {},
      workoutPhase: "Week 1-2",
      macroTargets: { ...DEFAULT_MACRO_TARGETS },
      plan,
      servings: {},
      ingredients: {},
      daily: {},
      notes: {},
      workouts: {},
      measurements: {},
      reflections: {},
      coachNotes: {},
      photoChecks: {},
      customIngredients: [],
      customProducts: [],
      customMeals: [],
      customMealDraft: [],
      nutritionLookup: {
        usdaApiKey: "",
        results: [],
        productScaleBasis: null,
        ingredientScaleBasis: null,
        target: "product",
        status: "Search by food name, brand, or barcode. Open Food Facts works without a key; USDA needs a free API key saved in this browser.",
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
      shoppingBought: { ...base.shoppingBought, ...(saved.shoppingBought || {}) },
      daily: { ...base.daily, ...(saved.daily || {}) },
      notes: { ...base.notes, ...(saved.notes || {}) },
      workouts: { ...base.workouts, ...(saved.workouts || {}) },
      measurements: { ...base.measurements, ...(saved.measurements || {}) },
      reflections: { ...base.reflections, ...(saved.reflections || {}) },
      coachNotes: { ...base.coachNotes, ...(saved.coachNotes || {}) },
      photoChecks: { ...base.photoChecks, ...(saved.photoChecks || {}) },
      macroTargets: normaliseMacroTargets(saved.macroTargets || base.macroTargets),
      servings: { ...base.servings, ...(saved.servings || {}) },
      customIngredients: Array.isArray(saved.customIngredients) ? saved.customIngredients : [],
      customProducts: Array.isArray(saved.customProducts) ? saved.customProducts : [],
      customMeals: Array.isArray(saved.customMeals) ? saved.customMeals : [],
      customMealDraft: Array.isArray(saved.customMealDraft) ? saved.customMealDraft : [],
      nutritionLookup: { ...base.nutritionLookup, ...(saved.nutritionLookup || {}), results: Array.isArray(saved.nutritionLookup?.results) ? saved.nutritionLookup.results : [] },
      labelScan: { ...base.labelScan, ...(saved.labelScan || {}) }
    };
    if (!saved.workoutPhase) {
      merged.workoutPhase = phaseForWeek(Number(merged.activeWeek) || 1);
    }
    cleanupBrokenPlanSlots(merged.plan);
    ensureFullPlanHistory(merged.plan);
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

  function ensureFullPlanHistory(plan) {
    for (let week = 1; week <= 8; week += 1) {
      plan[week] = plan[week] || {};
      for (const day of DAYS) {
        plan[week][day] = plan[week][day] || {};
        for (const slot of SLOTS) {
          if (!Object.prototype.hasOwnProperty.call(plan[week][day], slot.key)) {
            plan[week][day][slot.key] = "";
          }
        }
      }
    }
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
    if (elements.shoppingRange) elements.shoppingRange.value = state.shoppingRange || "next3";
    elements.workoutPhase.value = state.workoutPhase;
    syncMacroTargetInputs();
    if (elements.usdaApiKey) elements.usdaApiKey.value = state.nutritionLookup?.usdaApiKey || "";
  }

  function syncMacroTargetInputs() {
    const targets = currentMacroTargets();
    if (elements.targetCalories) elements.targetCalories.value = targets.calories;
    if (elements.targetProtein) elements.targetProtein.value = targets.protein;
    if (elements.targetCarbs) elements.targetCarbs.value = targets.carbs;
    if (elements.targetFat) elements.targetFat.value = targets.fat;
    if (elements.targetFibre) elements.targetFibre.value = targets.fibre;
  }

  function updateMacroTargetsFromInputs() {
    state.macroTargets = normaliseMacroTargets({
      calories: numberOf(elements.targetCalories),
      protein: numberOf(elements.targetProtein),
      carbs: numberOf(elements.targetCarbs),
      fat: numberOf(elements.targetFat),
      fibre: numberOf(elements.targetFibre)
    });
    saveAndRender(["today", "week", "stats"]);
  }

  function normaliseMacroTargets(targets) {
    const safeTargets = { ...DEFAULT_MACRO_TARGETS, ...(targets || {}) };
    return {
      calories: positiveTarget(safeTargets.calories, DEFAULT_MACRO_TARGETS.calories),
      protein: positiveTarget(safeTargets.protein, DEFAULT_MACRO_TARGETS.protein),
      carbs: positiveTarget(safeTargets.carbs, DEFAULT_MACRO_TARGETS.carbs),
      fat: positiveTarget(safeTargets.fat, DEFAULT_MACRO_TARGETS.fat),
      fibre: positiveTarget(safeTargets.fibre, DEFAULT_MACRO_TARGETS.fibre)
    };
  }

  function positiveTarget(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? round(number) : fallback;
  }

  function currentMacroTargets() {
    state.macroTargets = normaliseMacroTargets(state.macroTargets);
    return state.macroTargets;
  }

  function attachEvents() {
    document.querySelectorAll(".tab").forEach((button) => {
      button.addEventListener("click", () => {
        showView(button.dataset.view);
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

    elements.shoppingRange?.addEventListener("change", () => {
      state.shoppingRange = elements.shoppingRange.value || "next3";
      saveAndRender(["shopping"]);
    });

    elements.startShoppingTrip?.addEventListener("click", () => {
      state.shoppingMode = true;
      saveAndRender(["shopping"]);
      toast("Shopping trip started.");
    });

    elements.exitShoppingTrip?.addEventListener("click", () => {
      state.shoppingMode = false;
      saveAndRender(["shopping"]);
      toast("Back to planning view.");
    });

    elements.toggleBoughtItems?.addEventListener("click", () => {
      state.showBought = !state.showBought;
      saveAndRender(["shopping"]);
    });

    elements.workoutPhase.addEventListener("change", () => {
      state.workoutPhase = elements.workoutPhase.value;
      saveAndRender(["workouts", "stats"]);
    });

    elements.weeklyReflection.addEventListener("input", () => {
      state.reflections[state.activeWeek] = elements.weeklyReflection.value;
      saveState();
    });

    elements.coachNotes?.addEventListener("input", () => {
      state.coachNotes[state.activeWeek] = elements.coachNotes.value;
      saveState();
    });

    elements.planNext3Days?.addEventListener("click", () => {
      showView("week");
      document.querySelector('.tab[data-view="week"]')?.focus();
    });

    [
      elements.targetCalories,
      elements.targetProtein,
      elements.targetCarbs,
      elements.targetFat,
      elements.targetFibre
    ].forEach((input) => {
      input?.addEventListener("input", updateMacroTargetsFromInputs);
    });
    elements.resetMacroTargets?.addEventListener("click", () => {
      state.macroTargets = { ...DEFAULT_MACRO_TARGETS };
      syncMacroTargetInputs();
      saveAndRender(["today", "week", "stats"]);
      toast("Daily targets reset.");
    });

    document.querySelector("#resetDemo").addEventListener("click", () => {
      if (!confirm("Clear saved progress, notes, meal choices and shopping statuses on this browser? This cannot be undone.")) return;
      const savedUsdaApiKey = state.nutritionLookup?.usdaApiKey || valueOf(elements.usdaApiKey);
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState();
      state.nutritionLookup.usdaApiKey = savedUsdaApiKey;
      initialiseControls();
      saveAndRender();
      toast("Dashboard reset. Advanced food database key kept on this browser.");
    });

    document.querySelector("#updateApp").addEventListener("click", () => {
      updateAppFiles();
    });
    elements.installApp?.addEventListener("click", installAppToPhone);
    elements.updateNow?.addEventListener("click", () => updateAppFiles(availableAppVersion));
    elements.updateLater?.addEventListener("click", () => {
      if (elements.updateNotice) elements.updateNotice.hidden = true;
      toast("Update hidden for now. You can still refresh from Settings.");
    });
    elements.memberSignIn?.addEventListener("click", signInMember);
    elements.memberSignUp?.addEventListener("click", signUpMember);
    elements.memberSubscribe?.addEventListener("click", startMemberSubscription);
    elements.memberCheckAccess?.addEventListener("click", () => checkMemberAccess(currentMemberUser));
    elements.memberSignOut?.addEventListener("click", signOutMember);
    elements.headerMemberSignOut?.addEventListener("click", signOutMember);
    elements.exportState?.addEventListener("click", exportSavedDashboard);
    elements.copyStateText?.addEventListener("click", copySavedDashboardText);
    elements.importState?.addEventListener("click", () => elements.importStateFile?.click());
    elements.pasteStateText?.addEventListener("click", () => {
      elements.shareImportPanel.hidden = !elements.shareImportPanel.hidden;
      if (!elements.shareImportPanel.hidden) elements.shareImportText?.focus();
    });
    elements.importStateFile?.addEventListener("change", importSavedDashboard);
    elements.importPastedState?.addEventListener("click", importPastedDashboard);
    elements.clearShareImport?.addEventListener("click", () => {
      if (elements.shareImportText) elements.shareImportText.value = "";
      toast("Pasted text cleared.");
    });

    document.querySelector("#printToday").addEventListener("click", () => printView("today"));
    document.querySelector("#printWeek").addEventListener("click", () => printView("week"));
    document.querySelector("#printShopping").addEventListener("click", () => printView("shopping"));
    document.querySelector("#copyShopping").addEventListener("click", copyShoppingList);
    elements.saveCustomIngredient?.addEventListener("click", saveCustomIngredientFromForm);
    elements.clearCustomIngredient?.addEventListener("click", () => {
      clearCustomIngredientForm();
      editingCustomIngredientId = "";
      saveAndRender(["custom"]);
      toast("Ingredient form cleared.");
    });
    elements.customIngredientAmount?.addEventListener("change", rescaleCustomIngredientNutritionFromServing);
    elements.findIngredientNutrition?.addEventListener("click", findIngredientNutrition);
    elements.saveCustomProduct?.addEventListener("click", saveCustomProductFromForm);
    elements.clearCustomProduct?.addEventListener("click", () => {
      clearCustomProductForm();
      editingCustomProductId = "";
      setNutritionLookupStatus("Product form cleared. Your advanced food database key is still saved on this browser.", "neutral");
      saveAndRender(["custom"]);
      toast("Product form cleared.");
    });
    elements.customProductAmount?.addEventListener("change", rescaleProductNutritionFromServing);
    elements.findProductNutrition?.addEventListener("click", findProductNutrition);
    elements.saveUsdaApiKey?.addEventListener("click", saveUsdaApiKey);
    elements.labelPhoto?.addEventListener("change", handleLabelPhotoChange);
    elements.readLabelPhoto?.addEventListener("click", readLabelPhoto);
    elements.clearLabelPhoto?.addEventListener("click", clearLabelForm);
    elements.useLabelForIngredient?.addEventListener("click", useLabelForIngredient);
    elements.useLabelForProduct?.addEventListener("click", useLabelForProduct);
    elements.useManualLabelValues?.addEventListener("click", useManualLabelValues);
    elements.useManualLabelForProduct?.addEventListener("click", useManualLabelValuesForProduct);
    elements.manualEnergyKj?.addEventListener("input", updateManualCaloriesFromKj);
    elements.pdfSwapMeal?.addEventListener("change", () => saveAndRender(["custom"]));
    elements.startSwapMeal?.addEventListener("click", startSwapMealFromPdf);
    elements.mealIngredientName?.addEventListener("change", fillMealIngredientFromSelectedName);
    elements.mealIngredientName?.addEventListener("blur", fillMealIngredientFromSelectedName);
    elements.addMealIngredient?.addEventListener("click", addIngredientToCustomMealDraft);
    elements.clearMealIngredient?.addEventListener("click", () => {
      clearMealIngredientForm();
      saveAndRender(["custom"]);
      toast("Meal ingredient row cleared.");
    });
    elements.saveCustomMeal?.addEventListener("click", saveCustomMealFromDraft);
    elements.clearCustomMeal?.addEventListener("click", clearCustomMealDraft);

    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-plan-slot]")) {
        handlePlanSlotChange(target);
      }

      if (target.matches("[data-serving-slot]")) {
        handleServingChange(target);
      }

      if (target.matches("[data-product-planner-slot]")) {
        updateCustomProductPlannerSlot(target.dataset.productPlannerSlot, target.value);
      }

      if (target.matches("[data-product-shopping-category]")) {
        updateCustomProductShoppingCategory(target.dataset.productShoppingCategory, target.value);
      }

      if (target.matches("[data-ingredient-status]")) {
        state.ingredients[target.dataset.ingredientStatus] = target.value;
        delete state.shoppingBought?.[target.dataset.ingredientStatus];
        saveAndRender(["shopping", "meals", "stats"]);
      }

      if (target.matches("[data-shopping-bought]")) {
        state.shoppingBought[target.dataset.shoppingBought] = target.checked;
        saveAndRender(["shopping"]);
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

    document.addEventListener("keydown", (event) => {
      const row = event.target.closest?.("[data-shopping-bought-row]");
      if (!row || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      const item = row.dataset.shoppingBoughtRow;
      state.shoppingBought[item] = !shoppingBought(item);
      saveAndRender(["shopping"]);
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      const shoppingBoughtRow = target.closest?.("[data-shopping-bought-row]");
      if (shoppingBoughtRow && !target.matches("[data-shopping-bought]")) {
        const item = shoppingBoughtRow.dataset.shoppingBoughtRow;
        state.shoppingBought[item] = !shoppingBought(item);
        saveAndRender(["shopping"]);
        return;
      }

      if (target.matches("[data-remove-draft-ingredient]")) {
        removeDraftIngredient(target.dataset.removeDraftIngredient);
      }

      if (target.matches("[data-delete-custom-meal]")) {
        deleteCustomMeal(target.dataset.deleteCustomMeal);
      }

      if (target.matches("[data-edit-custom-meal]")) {
        editCustomMeal(target.dataset.editCustomMeal);
      }

      if (target.matches("[data-delete-custom-ingredient]")) {
        deleteCustomIngredient(target.dataset.deleteCustomIngredient);
      }

      if (target.matches("[data-edit-custom-ingredient]")) {
        editCustomIngredient(target.dataset.editCustomIngredient);
      }

      if (target.matches("[data-use-custom-ingredient]")) {
        fillMealIngredientFromBank(target.dataset.useCustomIngredient);
      }

      if (target.matches("[data-delete-custom-product]")) {
        deleteCustomProduct(target.dataset.deleteCustomProduct);
      }

      if (target.matches("[data-edit-custom-product]")) {
        editCustomProduct(target.dataset.editCustomProduct);
      }

      if (target.matches("[data-use-custom-product]")) {
        fillMealIngredientFromProduct(target.dataset.useCustomProduct);
      }

      if (target.matches("[data-use-lookup-result]")) {
        applyLookupResult(Number(target.dataset.useLookupResult));
      }

      if (target.matches("[data-jump-view]")) {
        showView(target.dataset.jumpView);
      }
    });
  }

  function showView(viewName) {
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewName));
    document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${viewName}`));
  }

  function handlePlanSlotChange(target) {
    const day = target.dataset.day;
    const slot = target.dataset.planSlot;
    if (!day || !slot) return;
    ensurePlanDay(state.activeWeek, day);
    const changed = state.plan[state.activeWeek][day][slot] !== target.value;
    state.plan[state.activeWeek][day][slot] = target.value;
    if (changed) delete state.servings[servingKey(state.activeWeek, day, slot)];
    const recipe = recipeByName.get(target.value);
    saveAndRender(["today", "week", "shopping", "meals", "stats"]);
    if (recipe && changed) {
      toast(`${recipe.name} added to ${day}. Shopping list updated.`);
    } else if (changed && !target.value) {
      toast(`${slotLabel(slot)} cleared for ${day}. Shopping list updated.`);
    }
  }

  function handleServingChange(target) {
    const day = target.dataset.day;
    const slot = target.dataset.servingSlot;
    if (!day || !slot) return;
    const key = servingKey(state.activeWeek, day, slot);
    const value = valueOf(target);
    if (value) {
      state.servings[key] = value;
    } else {
      delete state.servings[key];
    }
    saveAndRender(["today", "week", "shopping", "stats"]);
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
    if (elements.todayHeading) elements.todayHeading.textContent = `Today: Week ${state.activeWeek}, ${day}`;
    elements.todayTitle.textContent = `What to eat today`;
    if (elements.todaySundayMessage) {
      const isSunday = day === "Sunday";
      elements.todaySundayMessage.hidden = !isSunday;
      elements.todaySundayMessage.textContent = isSunday
        ? "Sunday is flexible. Choose meals that still support your goal, use leftovers, repeat a favourite meal, or add your own meal. Tracking is optional today."
        : "";
    }
    elements.todayNotes.value = state.notes[noteKey()] || "";
    elements.todayMeals.innerHTML = SLOTS.map((slot) => {
      const recipe = recipeByName.get(plan[slot.key]);
      const scaledRecipe = recipe ? scaledRecipeForSlot(day, slot.key) : null;
      return `
        <article class="summary-tile ${recipe ? "is-filled" : "is-empty"}">
          <div class="tile-heading">${escapeHtml(slot.label)}</div>
          <div class="today-meal-name">${recipe ? mealNameWithSource(recipe) : "Add a meal for today"}</div>
          ${scaledRecipe ? macroPriorityHtml(scaledRecipe) : `<div class="empty-action">Choose this meal in My Week</div>`}
        </article>
      `;
    }).join("");
    if (elements.todayTotals) {
      elements.todayTotals.innerHTML = dailyTotalsHtml(day);
    }
    if (elements.todayWorkout) {
      elements.todayWorkout.innerHTML = todayWorkoutHtml(day);
    }

    const currentChecks = state.daily[dailyKey(state.activeWeek, day)] || {};
    const visibleChecks = visibleDailyChecks(day);
    const progress = dailyCheckProgress(state.activeWeek, day);
    elements.dailyChecks.innerHTML = `${visibleChecks.map((check) => `
      <label class="check-item">
        <input type="checkbox" data-daily-check="${check.key}" ${currentChecks[check.key] ? "checked" : ""}>
        <span>${escapeHtml(check.label)}</span>
      </label>
    `).join("")}<div class="daily-check-progress">${progress.ticked} of ${progress.total} completed today</div>`;
  }

  function renderWeek() {
    if (elements.weekSummary) {
      elements.weekSummary.innerHTML = weeklySummaryHtml();
    }
    elements.weekGrid.innerHTML = DAYS.map((day) => {
      ensurePlanDay(state.activeWeek, day);
      const dayPlan = state.plan[state.activeWeek][day];
      const meals = selectedMealsForDay(day);
      const macros = sumMacros(meals);
      const isSunday = day === "Sunday";
      return `
        <article class="day-card ${isSunday ? "flexible-day" : ""}">
          <h3>${escapeHtml(isSunday ? "Sunday - Flexible day" : day)}</h3>
          ${isSunday ? `<p class="item-meta flexible-day-note">Tracking is optional. Use leftovers, repeat a favourite, or add your own meal.</p>` : ""}
          ${SLOTS.map((slot) => mealSelectHtml(day, slot, dayPlan[slot.key])).join("")}
          ${isSunday && !meals.length
            ? `<div class="day-macros flexible-note">Flexible day - blank is okay.</div>`
            : `<div class="day-macros ${calorieStatusClass(macros.calories)}">${macroSummary(macros)} | ${calorieRemainingText(macros.calories)}</div>`}
        </article>
      `;
    }).join("");
  }

  function mealSelectHtml(day, slot, selected) {
    const selectedRecipe = recipeByName.get(selected);
    const options = recipes
      .filter((recipe) => slot.allowAll || slot.types.includes(recipe.type))
      .map((recipe) => `<option value="${escapeHtml(recipe.name)}" ${recipe.name === selected ? "selected" : ""}>${escapeHtml(recipe.name)}${recipe.source === "Custom" ? " (Custom)" : recipe.source === "Product" ? " (Product)" : recipe.source === "Ingredient" ? " (Ingredient)" : ""}</option>`)
      .join("");
    return `
      <div class="meal-slot">
        <label>${escapeHtml(slot.label)}</label>
        <select class="field" data-plan-slot="${slot.key}" data-day="${escapeHtml(day)}" onchange="window.nutriSculptPickMeal(this)" oninput="window.nutriSculptPickMeal(this)">
          <option value="">No meal selected</option>
          ${options}
        </select>
        <span class="slot-helper">You can change or clear a meal at any time.</span>
        ${selectedRecipe ? selectedMealPreviewHtml(selectedRecipe, day, slot) : emptyMealPreviewHtml(slot)}
      </div>
    `;
  }

  function selectedMealPreviewHtml(recipe, day, slot) {
    const scaledRecipe = scaledRecipeForSlot(day, slot.key) || recipe;
    const ingredients = (recipe.ingredients || []).slice(0, 4).map((ingredient) => ingredient.item).join(", ");
    return `
      <div class="selected-meal-preview is-filled" aria-live="polite">
        <strong>${mealNameWithSource(recipe)}</strong>
        ${servingOverrideHtml(day, slot, recipe)}
        ${macroHtml(scaledRecipe)}
        <span class="item-meta">Shopping added: ${escapeHtml(ingredients)}${(recipe.ingredients || []).length > 4 ? "..." : ""}</span>
      </div>
    `;
  }

  function servingOverrideHtml(day, slot, recipe) {
    const current = servingValue(day, slot.key);
    const placeholder = servingPlaceholder(recipe);
    const summary = current ? `Serving: ${current}` : `Serving: ${servingDefaultText(recipe)}`;
    return `
      <details class="serving-override">
        <summary>${escapeHtml(summary)}</summary>
        <label>
          <span>Change for this day</span>
          <input class="field mini-field" data-serving-slot="${escapeHtml(slot.key)}" data-day="${escapeHtml(day)}" value="${escapeHtml(current)}" placeholder="${escapeHtml(placeholder)}">
        </label>
      </details>
    `;
  }

  function emptyMealPreviewHtml(slot) {
    return `
      <div class="selected-meal-preview">
        Choose this ${escapeHtml(slot.label.toLowerCase())} in My Week to update the shopping list.
      </div>
    `;
  }

  function weeklySummaryHtml() {
    const plannedCount = DAYS.reduce((count, day) => {
      ensurePlanDay(state.activeWeek, day);
      return count + SLOTS.filter((slot) => state.plan[state.activeWeek][day]?.[slot.key]).length;
    }, 0);
    const workoutCount = completedWorkoutDaysForWeek();
    const habitPercent = dailyRulesPercent(state.activeWeek, state.todayDay);
    return `
      <article class="mini-summary">
        <span class="stat-label">Meals planned</span>
        <strong>${plannedCount}</strong>
      </article>
      <article class="mini-summary">
        <span class="stat-label">Workouts done</span>
        <strong>${workoutCount}/3</strong>
      </article>
      <article class="mini-summary">
        <span class="stat-label">Today's habits</span>
        <strong>${habitPercent}%</strong>
      </article>
    `;
  }

  function renderMeals() {
    const search = state.mealSearch.trim().toLowerCase();
    const selectedType = state.mealTypeFilter;
    let list = mealRecipes.filter((recipe) => {
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
    return `
      <article class="meal-card">
        <div class="meal-card-header">
          <div>
            <h3>${escapeHtml(recipe.name)}</h3>
            ${macroPriorityHtml(recipe)}
          </div>
          <div class="meal-card-actions">
            ${mealCardEditButton(recipe)}
            <span class="type-badge">${escapeHtml(sourceLabel(recipe))}</span>
          </div>
        </div>
        ${recipe.source === "Custom" ? `<p class="item-meta">My custom meal. Source values come from confirmed ingredients.</p>` : ""}
        ${recipe.notes ? `<p class="item-meta">${escapeHtml(recipe.notes)}</p>` : ""}
        <ul class="ingredients">
          ${(recipe.ingredients || []).map((ingredient) => ingredientRowHtml(ingredient, false)).join("")}
        </ul>
      </article>
    `;
  }

  function mealCardEditButton(recipe) {
    if (recipe.source === "Custom") {
      return `<button class="ghost-button small-button" type="button" data-edit-custom-meal="${escapeHtml(recipe.id)}">Edit</button>`;
    }
    return "";
  }

  function ingredientRowHtml(ingredient, editable) {
    const status = ingredientStatus(ingredient.item);
    return `
      <li>
        <span><strong>${escapeHtml(ingredient.item)}</strong><br><span class="item-meta">${escapeHtml(ingredient.amount || "")}</span></span>
        ${editable ? statusSelectHtml(ingredient.item, status) : ""}
      </li>
    `;
  }

  function renderShopping() {
    const scope = state.showAllShopping ? "all" : (state.shoppingRange || "next3");
    const items = aggregateShopping(scope);
    syncShoppingModeControls();
    if (!items.length) {
      elements.shoppingList.innerHTML = `
        <section class="shopping-category">
          <h3>No meals selected yet</h3>
          <div class="shopping-item">
            <div class="item-title">No meals selected yet. Go to My Week and choose meals, or start with the next 3 days.</div>
            <div></div><div></div><div></div>
          </div>
        </section>
      `;
      return;
    }

    if (state.shoppingMode) {
      elements.shoppingList.innerHTML = shoppingTripHtml(items);
      return;
    }

    const grouped = groupBy(items, "category");
    elements.shoppingList.innerHTML = orderedShoppingCategories(grouped)
      .map((category) => `
        <section class="shopping-category">
          <h3>${escapeHtml(category)} (${grouped[category].length})</h3>
          ${grouped[category].map((item) => shoppingItemHtml(item)).join("")}
        </section>
      `).join("");
  }

  function syncShoppingModeControls() {
    if (elements.shoppingModeIntro) {
      elements.shoppingModeIntro.textContent = state.shoppingMode
        ? "Only your Need to buy and Optional items are shown here. Tick items off as you shop."
        : "First mark what you already have, what you need to buy, what is optional, and what you want to skip.";
    }
    if (elements.startShoppingTrip) {
      elements.startShoppingTrip.hidden = Boolean(state.shoppingMode);
    }
    if (elements.exitShoppingTrip) {
      elements.exitShoppingTrip.hidden = !state.shoppingMode;
    }
    if (elements.toggleBoughtItems) {
      elements.toggleBoughtItems.hidden = !state.shoppingMode;
      elements.toggleBoughtItems.textContent = state.showBought ? "Hide bought items" : "Show bought items";
    }
  }

  function orderedShoppingCategories(grouped) {
    const known = CATEGORY_ORDER.filter((category) => grouped[category]);
    const extra = Object.keys(grouped)
      .filter((category) => !CATEGORY_ORDER.includes(category))
      .sort((a, b) => a.localeCompare(b));
    return [...known, ...extra];
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

  function shoppingTripHtml(items) {
    const tripItems = items.filter((item) => ["Need to buy", "Optional"].includes(ingredientStatus(item.item)));
    const toBuy = tripItems.filter((item) => !shoppingBought(item.item));
    const bought = tripItems.filter((item) => shoppingBought(item.item));
    if (!toBuy.length && (!state.showBought || !bought.length)) {
      return `
        <section class="shopping-category">
          <h3>No shopping trip items</h3>
          <div class="shopping-trip-empty">No Need to buy or Optional items are showing in this shopping scope.</div>
        </section>
      `;
    }
    const toBuyGrouped = groupBy(toBuy, "category");
    const boughtHtml = state.showBought && bought.length
      ? `<section class="shopping-category bought-section"><h3>Bought (${bought.length})</h3>${bought.map((item) => shoppingTripItemHtml(item, true)).join("")}</section>`
      : "";
    return `${orderedShoppingCategories(toBuyGrouped).map((category) => `
      <section class="shopping-category shopping-trip-category">
        <h3>${escapeHtml(category)} (${toBuyGrouped[category].length})</h3>
        ${toBuyGrouped[category].map((item) => shoppingTripItemHtml(item, false)).join("")}
      </section>
    `).join("")}${boughtHtml}`;
  }

  function shoppingTripItemHtml(item, bought) {
    const status = ingredientStatus(item.item);
    return `
      <div class="shopping-trip-item ${bought ? "is-bought" : ""}" data-shopping-bought-row="${escapeHtml(item.item)}" role="checkbox" aria-checked="${bought ? "true" : "false"}" tabindex="0">
        <input type="checkbox" data-shopping-bought="${escapeHtml(item.item)}" ${bought ? "checked" : ""}>
        <span class="shopping-trip-copy">
          <strong>${escapeHtml(item.item)}</strong>
          <span>${escapeHtml(item.amounts.join("; "))}</span>
          <small>Used in: ${escapeHtml(item.usedIn.join("; "))}</small>
        </span>
        <span class="pill ${statusClass(status)}">${escapeHtml(status)}</span>
      </div>
    `;
  }

  function shoppingBought(item) {
    return Boolean(state.shoppingBought?.[item]);
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
    const workoutCount = completedWorkoutDaysForWeek();
    if (elements.workoutSummary) {
      elements.workoutSummary.textContent = `This week: ${workoutCount}/3 workouts done. Complete 3 workouts this week. Extra movement is optional.`;
    }
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
            <input type="checkbox" data-workout-check="${escapeHtml(key)}" ${workoutDone(workout) ? "checked" : ""}>
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
    if (elements.coachNotes) {
      elements.coachNotes.value = state.coachNotes?.[state.activeWeek] || "";
    }
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
          <div class="item-meta">Serving: ${escapeHtml(ingredient.amount || "1 serving")} | ${nutritionLine(ingredient)}</div>
          <div class="item-meta">${escapeHtml(ingredient.source || "Manual entry - needs review")}${ingredient.verified ? " | confirmed" : " | needs review"}</div>
        </div>
        <div class="custom-actions">
          <button class="ghost-button small-button" type="button" data-use-custom-ingredient="${escapeHtml(ingredient.id)}">Use</button>
          <button class="ghost-button small-button" type="button" data-edit-custom-ingredient="${escapeHtml(ingredient.id)}">Edit</button>
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
            <div class="item-meta">${escapeHtml(product.brand || "No brand")} | ${escapeHtml(recipe.type)} | Serving: ${escapeHtml(recipe.servings || product.amount || "1 serving")} | ${nutritionLine(recipe)}</div>
            <div class="item-meta">${escapeHtml(product.source || "Manual entry - needs review")}${product.verified ? " | confirmed" : " | needs review"}</div>
            <div class="saved-product-controls">
              <label>
                <span>Planner slot</span>
                <select class="field mini-select" data-product-planner-slot="${escapeHtml(product.id)}">
                  ${plannerSlotOptions(recipe.type)}
                </select>
              </label>
              <label>
                <span>Shopping category</span>
                <select class="field mini-select" data-product-shopping-category="${escapeHtml(product.id)}">
                  ${shoppingCategoryOptions(productCategory(product))}
                </select>
              </label>
            </div>
          </div>
          <div class="custom-actions">
            <button class="ghost-button small-button" type="button" data-use-custom-product="${escapeHtml(product.id)}">Use in meal</button>
            <button class="ghost-button small-button" type="button" data-edit-custom-product="${escapeHtml(product.id)}">Edit</button>
            <button class="ghost-button small-button" type="button" data-delete-custom-product="${escapeHtml(product.id)}">Delete</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function plannerSlotOptions(selected) {
    const options = SLOTS
      .flatMap((slot) => slot.types)
      .filter((type, index, list) => list.indexOf(type) === index)
      .filter((type) => type !== "Other");
    return options.map((type) => `<option value="${escapeHtml(type)}" ${type === selected ? "selected" : ""}>${escapeHtml(type)}</option>`).join("");
  }

  function shoppingCategoryOptions(selected) {
    return CATEGORY_ORDER.map((category) => `<option value="${escapeHtml(category)}" ${category === selected ? "selected" : ""}>${escapeHtml(category)}</option>`).join("");
  }

  function lookupResultsHtml() {
    const results = state.nutritionLookup?.results || [];
    const target = nutritionLookupTarget();
    if (!results.length) {
      return `<div class="empty-panel">Search results will appear here. Pick a result to fill the ${target} form, then press Save ${target}.</div>`;
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
            <div class="item-meta">${escapeHtml(recipe.type)} | Serving: ${escapeHtml(recipe.servings || "1 serving")} | ${nutritionLine(recipe)}</div>
            <div class="item-meta">${escapeHtml((recipe.ingredients || []).map((ingredient) => ingredient.item).join(", "))}</div>
          </div>
          <div class="custom-actions">
            <button class="ghost-button small-button" type="button" data-edit-custom-meal="${escapeHtml(meal.id)}">Edit</button>
            <button class="ghost-button small-button" type="button" data-delete-custom-meal="${escapeHtml(meal.id)}">Delete</button>
          </div>
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
    const editingIndex = editingCustomIngredientId
      ? (state.customIngredients || []).findIndex((item) => item.id === editingCustomIngredientId)
      : -1;
    const existing = (state.customIngredients || []).findIndex((item) => item.item.toLowerCase() === ingredient.item.toLowerCase());
    if (editingIndex >= 0) {
      const previous = state.customIngredients[editingIndex];
      const safeIngredient = { ...ingredient };
      if (safeIngredient.item !== previous.item && recipeByName.has(safeIngredient.item)) {
        safeIngredient.item = uniqueIngredientName(safeIngredient.item);
      }
      state.customIngredients[editingIndex] = { ...previous, ...safeIngredient, id: previous.id };
      replaceMealInPlans(previous.item, safeIngredient.item);
      editingCustomIngredientId = "";
    } else if (existing >= 0) {
      state.customIngredients[existing] = { ...state.customIngredients[existing], ...ingredient, id: state.customIngredients[existing].id };
    } else {
      const safeIngredient = { ...ingredient };
      if (recipeByName.has(safeIngredient.item)) {
        safeIngredient.item = uniqueIngredientName(safeIngredient.item);
      }
      state.customIngredients.push({ ...safeIngredient, id: uniqueId("ingredient") });
    }
    clearCustomIngredientForm();
    updateRecipeIndexes();
    initialiseControls();
    saveAndRender();
    toast(`${ingredient.item} saved. It is now available in Other.`);
  }

  function editCustomIngredient(id) {
    const ingredient = (state.customIngredients || []).find((item) => item.id === id);
    if (!ingredient) return;
    editingCustomIngredientId = id;
    fillCustomIngredientForm(ingredient);
    showView("custom");
    toast("Ingredient loaded. Edit the form, then press Save ingredient.");
  }

  function fillCustomIngredientForm(ingredient) {
    elements.customIngredientName.value = ingredient.item || ingredient.name || "";
    elements.customIngredientBrand.value = ingredient.brand || "";
    elements.customIngredientAmount.value = ingredient.amount || "";
    elements.customIngredientCategory.value = ingredient.category || "Protein";
    elements.customIngredientCalories.value = ingredient.calories ?? "";
    elements.customIngredientProtein.value = ingredient.protein_g ?? "";
    elements.customIngredientCarbs.value = ingredient.carbs_g ?? "";
    elements.customIngredientFat.value = ingredient.fat_g ?? "";
    elements.customIngredientFibre.value = ingredient.fibre_g ?? "";
    elements.customIngredientSource.value = ingredient.source || "Manual entry - needs review";
    elements.customIngredientSourceUrl.value = ingredient.sourceUrl || "";
    elements.customIngredientVerified.checked = Boolean(ingredient.verified);
  }

  function fillCustomIngredientFormFromLookup(result) {
    const ingredient = {
      item: result.name || result.item || "",
      brand: result.brand || "",
      amount: result.amount || result.servingSize || "100 g",
      category: result.category || inferProductCategory(result.name || result.item),
      calories: result.calories,
      protein_g: result.protein_g,
      carbs_g: result.carbs_g,
      fat_g: result.fat_g,
      fibre_g: result.fibre_g,
      source: result.source || "Manual entry - needs review",
      sourceUrl: result.sourceUrl || result.url || "",
      verified: Boolean(result.verified)
    };
    fillCustomIngredientForm(ingredient);
    setIngredientScaleBasis(ingredient.amount, ingredient);
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

    const editingIndex = editingCustomProductId
      ? (state.customProducts || []).findIndex((item) => item.id === editingCustomProductId)
      : -1;
    const existing = (state.customProducts || []).findIndex((item) => item.name.toLowerCase() === product.name.toLowerCase());
    if (editingIndex >= 0) {
      const previous = state.customProducts[editingIndex];
      const safeProduct = { ...product };
      if (safeProduct.name !== previous.name && recipeByName.has(safeProduct.name)) {
        safeProduct.name = uniqueProductName(safeProduct.name);
      }
      state.customProducts[editingIndex] = { ...previous, ...safeProduct, id: previous.id };
      replaceMealInPlans(previous.name, safeProduct.name);
      editingCustomProductId = "";
    } else if (existing >= 0) {
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
    toast(`${product.name} saved. It is now available in My Week.`);
  }

  function editCustomProduct(id) {
    const product = (state.customProducts || []).find((item) => item.id === id);
    if (!product) return;
    editingCustomProductId = id;
    fillProductForm(product);
    showView("custom");
    toast("Product loaded. Edit the form, then press Save product.");
  }

  function updateCustomProductPlannerSlot(id, type) {
    const product = (state.customProducts || []).find((item) => item.id === id);
    if (!product) return;
    product.type = type || inferProductType(product.name || product.item);
    updateRecipeIndexes();
    initialiseControls();
    saveAndRender(["custom", "meals", "week", "today", "shopping", "stats"]);
    toast(`${product.name} moved to ${product.type}.`);
  }

  function updateCustomProductShoppingCategory(id, category) {
    const product = (state.customProducts || []).find((item) => item.id === id);
    if (!product) return;
    product.category = category || inferProductCategory(product.name || product.item);
    updateRecipeIndexes();
    saveAndRender(["custom", "meals", "shopping"]);
    toast(`${product.name} shopping category updated.`);
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
    setProductScaleBasis(product.amount || product.servingSize || "", product);
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
    state.nutritionLookup.results = [];
    state.nutritionLookup.productScaleBasis = null;
  }

  function setProductScaleBasis(amount, source) {
    const grams = servingGramsFromText(amount);
    if (!grams || !source || !hasMacroValues(source)) {
      state.nutritionLookup.productScaleBasis = null;
      return;
    }
    state.nutritionLookup.productScaleBasis = {
      grams,
      amount,
      calories: Number(source.calories) || 0,
      protein_g: Number(source.protein_g) || 0,
      carbs_g: Number(source.carbs_g) || 0,
      fat_g: Number(source.fat_g) || 0,
      fibre_g: Number(source.fibre_g) || 0
    };
  }

  function setIngredientScaleBasis(amount, source) {
    const grams = servingGramsFromText(amount);
    if (!grams || !source || !hasMacroValues(source)) {
      state.nutritionLookup.ingredientScaleBasis = null;
      return;
    }
    state.nutritionLookup.ingredientScaleBasis = {
      grams,
      amount,
      calories: Number(source.calories) || 0,
      protein_g: Number(source.protein_g) || 0,
      carbs_g: Number(source.carbs_g) || 0,
      fat_g: Number(source.fat_g) || 0,
      fibre_g: Number(source.fibre_g) || 0
    };
  }

  function rescaleProductNutritionFromServing() {
    const basis = state.nutritionLookup?.productScaleBasis;
    const targetGrams = servingGramsFromText(valueOf(elements.customProductAmount));
    if (!basis?.grams || !targetGrams) return;
    const factor = targetGrams / basis.grams;
    elements.customProductCalories.value = Math.round((Number(basis.calories) || 0) * factor);
    elements.customProductProtein.value = round((Number(basis.protein_g) || 0) * factor);
    elements.customProductCarbs.value = round((Number(basis.carbs_g) || 0) * factor);
    elements.customProductFat.value = round((Number(basis.fat_g) || 0) * factor);
    elements.customProductFibre.value = round((Number(basis.fibre_g) || 0) * factor);
    setNutritionLookupStatus(`Serving changed from ${basis.amount} to ${valueOf(elements.customProductAmount)}. Calories and macros were adjusted automatically.`, "success");
    renderCustom();
  }

  function rescaleCustomIngredientNutritionFromServing() {
    const basis = state.nutritionLookup?.ingredientScaleBasis;
    const targetGrams = servingGramsFromText(valueOf(elements.customIngredientAmount));
    if (!basis?.grams || !targetGrams) return;
    const factor = targetGrams / basis.grams;
    elements.customIngredientCalories.value = Math.round((Number(basis.calories) || 0) * factor);
    elements.customIngredientProtein.value = round((Number(basis.protein_g) || 0) * factor);
    elements.customIngredientCarbs.value = round((Number(basis.carbs_g) || 0) * factor);
    elements.customIngredientFat.value = round((Number(basis.fat_g) || 0) * factor);
    elements.customIngredientFibre.value = round((Number(basis.fibre_g) || 0) * factor);
    setNutritionLookupStatus(`Serving changed from ${basis.amount} to ${valueOf(elements.customIngredientAmount)}. Calories and macros were adjusted automatically.`, "success");
    renderCustom();
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

  function fillMealIngredientFromSelectedName() {
    const selectedName = valueOf(elements.mealIngredientName);
    if (!selectedName) return;
    const ingredient = findKnownIngredient(selectedName);
    if (!ingredient) return;
    fillMealIngredientFields(ingredient);
  }

  function saveUsdaApiKey() {
    state.nutritionLookup.usdaApiKey = valueOf(elements.usdaApiKey);
    const message = state.nutritionLookup.usdaApiKey
      ? "Advanced food database search enabled on this browser."
      : "Advanced food database key cleared. Open Food Facts will still work.";
    setNutritionLookupStatus(message, state.nutritionLookup.usdaApiKey ? "success" : "neutral");
    saveAndRender(["custom"]);
    toast(message);
  }

  async function findIngredientNutrition() {
    return findNutritionForForm("ingredient");
  }

  async function findProductNutrition() {
    return findNutritionForForm("product");
  }

  async function findNutritionForForm(target) {
    const lookupTarget = target === "ingredient" ? "ingredient" : "product";
    const requestedFood = lookupRequestForTarget(lookupTarget);
    const query = [requestedFood.name, requestedFood.brand].filter(Boolean).join(" ").trim();
    const barcode = String(requestedFood.barcode || "").replace(/\s+/g, "");
    if (!query && !barcode) {
      toast(`Type a ${lookupTarget} name${lookupTarget === "product" ? " or barcode" : ""} first.`);
      return;
    }

    state.nutritionLookup.target = lookupTarget;
    state.nutritionLookup.results = [];
    setNutritionLookupStatus(`Searching nutrition sources for this ${lookupTarget}...`, "neutral");
    renderCustom();
    setLookupButtonsBusy(lookupTarget, true);

    const messages = [];
    const localResults = searchSavedNutrition(query, barcode);
    const searches = [{ name: "Open Food Facts", promise: searchOpenFoodFacts(query, barcode) }];
    const usdaKey = state.nutritionLookup.usdaApiKey || valueOf(elements.usdaApiKey);
    if (query && usdaKey) {
      searches.push({ name: "USDA", promise: searchUsdaFoods(query, usdaKey) });
    } else if (query) {
        messages.push("Advanced food database not searched because no key is saved.");
    }

    try {
      const settled = await Promise.allSettled(searches.map((source) =>
        source.promise.then((results) => ({ name: source.name, results }))
      ));
      const remoteResults = settled.flatMap((item) => item.status === "fulfilled" ? item.value.results : []);
      const failedSources = settled
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.status === "rejected")
        .map(({ index }) => searches[index].name);
      const emptySources = settled
        .filter((item) => item.status === "fulfilled" && !item.value.results.length)
        .map((item) => item.value.name);
      if (failedSources.length) messages.push(`${failedSources.join(", ")} could not be reached.`);
      if (emptySources.length && remoteResults.length) messages.push(`${emptySources.join(", ")} searched but did not find a usable match.`);

      const rankedResults = rankLookupResults(dedupeLookupResults([...localResults, ...remoteResults]), requestedFood, barcode);
      const filteredResults = rankedResults.filter((result) => result.rankScore >= 25);
      state.nutritionLookup.results = filteredResults.slice(0, 8);
      const weakSources = weakSourceNames(settled, filteredResults);
      if (weakSources.length) messages.push(`${weakSources.join(", ")} searched but only returned weak or unrelated matches.`);
      if (rankedResults.length && !state.nutritionLookup.results.length) {
        messages.push("Sources searched, but only weak unrelated matches were found.");
      }
      if (state.nutritionLookup.results.length) {
        const best = state.nutritionLookup.results[0];
        messages.unshift(`${best.confidenceLabel || "Recommended"} match found first. Check serving size, then use values or save ${lookupTarget}.`);
        messages.push("MyFitnessPal official API is not connected, so it is not searched automatically.");
        setNutritionLookupStatus(messages.join(" "), "success");
      } else {
        messages.unshift(`No reliable nutrition match found. Try a more exact brand name${lookupTarget === "product" ? ", a barcode" : ""}, an advanced food database key, or the nutrition label photo.`);
        messages.push("MyFitnessPal official API is not connected, so it is not searched automatically.");
        setNutritionLookupStatus(messages.join(" "), "warning");
      }
    } catch {
      setNutritionLookupStatus("Nutrition sources could not be searched right now. You can still use the label photo or manual values.", "warning");
    } finally {
      setLookupButtonsBusy(lookupTarget, false);
      saveAndRender(["custom"]);
    }
  }

  function lookupRequestForTarget(target) {
    if (target === "ingredient") {
      const ingredient = readIngredientForm("custom");
      return {
        name: ingredient.item,
        brand: ingredient.brand || "",
        barcode: "",
        amount: ingredient.amount,
        type: inferProductType(ingredient.item),
        category: ingredient.category || inferProductCategory(ingredient.item)
      };
    }
    return readProductForm();
  }

  function setLookupButtonsBusy(target, busy) {
    const button = target === "ingredient" ? elements.findIngredientNutrition : elements.findProductNutrition;
    if (!button) return;
    button.disabled = busy;
    button.textContent = busy ? "Searching..." : (target === "ingredient" ? "Look up ingredient" : "Look up nutrition");
  }

  async function searchOpenFoodFacts(query, barcode) {
    const products = [];
    if (barcode) {
      const barcodeUrl = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}?fields=product_name,brands,quantity,serving_size,nutriments,code`;
      const barcodeJson = await fetchJson(barcodeUrl);
      if (barcodeJson?.status === 1 && barcodeJson.product) products.push({ ...barcodeJson.product, _matchBy: "barcode" });
    }
    if (query) {
      const searchUrl = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(query)}&page_size=5&fields=product_name,brands,quantity,serving_size,nutriments,code`;
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

  function weakSourceNames(settled, keptResults) {
    const keptSources = new Set(keptResults.map((result) => sourceGroupName(result.source)));
    return settled
      .filter((item) => item.status === "fulfilled" && item.value.results.length)
      .map((item) => item.value.name)
      .filter((sourceName) => !keptSources.has(sourceName));
  }

  function sourceGroupName(source) {
    if (source === "USDA FoodData Central") return "USDA";
    return source || "";
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
    const value = String(text || "").trim();
    const match = value.match(/(\d+(?:[.,]\d+)?)\s*(g|gram|grams|ml|mℓ)/i);
    if (match) return numberFromValue(match[1]);
    return /^\d+(?:[.,]\d+)?$/.test(value) ? numberFromValue(value) : 0;
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
    const target = nutritionLookupTarget();
    if (target === "ingredient") {
      fillCustomIngredientFormFromLookup(result);
      setNutritionLookupStatus("Values filled into the ingredient form. Check the serving size, then press Save ingredient.", "success");
      toast("Ingredient values filled.");
    } else {
      fillProductForm(result);
      setNutritionLookupStatus("Values filled into the product form. Check the serving size, then press Save product.", "success");
      toast("Product values filled.");
    }
    saveAndRender(["custom"]);
  }

  function nutritionLookupTarget() {
    return state.nutritionLookup?.target === "ingredient" ? "ingredient" : "product";
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
    const editingIndex = editingCustomMealId
      ? (state.customMeals || []).findIndex((item) => item.id === editingCustomMealId)
      : -1;
    const previous = editingIndex >= 0 ? state.customMeals[editingIndex] : null;
    let safeName = name;
    if (!previous || previous.name !== name) {
      safeName = uniqueMealName(name);
    }
    const meal = {
      id: previous?.id || uniqueId("meal"),
      name: safeName,
      type: valueOf(elements.customMealType) || "Lunch or Dinner",
      servings: valueOf(elements.customMealServings) || "1 serving",
      notes: valueOf(elements.customMealNotes),
      ingredients: state.customMealDraft.map(({ id, ...ingredient }) => ingredient)
    };
    if (editingIndex >= 0) {
      state.customMeals[editingIndex] = meal;
      replaceMealInPlans(previous.name, meal.name);
      editingCustomMealId = "";
    } else {
      state.customMeals.push(meal);
    }
    state.customMealDraft = [];
    elements.customMealName.value = "";
    elements.customMealServings.value = "";
    elements.customMealNotes.value = "";
    updateRecipeIndexes();
    initialiseControls();
    saveAndRender();
    toast(`${safeName} saved. It is now in the planner.`);
  }

  function editCustomMeal(id) {
    const meal = (state.customMeals || []).find((item) => item.id === id);
    if (!meal) return;
    editingCustomMealId = id;
    elements.customMealName.value = meal.name || "";
    elements.customMealType.value = meal.type || "Lunch or Dinner";
    elements.customMealServings.value = meal.servings || "1 serving";
    elements.customMealNotes.value = meal.notes || "";
    state.customMealDraft = (meal.ingredients || []).map((ingredient) => ({
      ...ingredient,
      id: uniqueId("draft")
    }));
    saveAndRender(["custom"]);
    showView("custom");
    toast("Meal loaded. Edit the ingredients, then press Save meal.");
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
    elements.customMealServings.value = recipe.servings || "1 serving";
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
    if (elements.customMealName) elements.customMealName.value = "";
    if (elements.customMealServings) elements.customMealServings.value = "";
    if (elements.customMealNotes) elements.customMealNotes.value = "";
    if (elements.pdfSwapMeal) elements.pdfSwapMeal.value = "";
    editingCustomMealId = "";
    clearMealIngredientForm();
    saveAndRender(["custom"]);
    toast("Custom meal form cleared.");
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
    const ingredient = (state.customIngredients || []).find((item) => item.id === id);
    state.customIngredients = (state.customIngredients || []).filter((item) => item.id !== id);
    if (ingredient) removeMealFromPlans(ingredient.item);
    updateRecipeIndexes();
    initialiseControls();
    saveAndRender();
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
      const structuredText = structuredOcrTableText(result?.data);
      const scanText = [rawText, structuredText].filter(Boolean).join("\n");
      state.labelScan.text = englishOnlyNutritionText(scanText);
      const parsed = parseNutritionText(scanText);
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

  function clearLabelForm() {
    clearLabelReadValues();
    state.labelScan.photo = "";
    setLabelStatus("Upload a clear photo or type the per-serving values below.", "neutral");
    if (elements.labelPhoto) elements.labelPhoto.value = "";
    if (elements.labelPreview) {
      elements.labelPreview.src = "";
      elements.labelPreview.hidden = true;
    }
    saveAndRender(["custom"]);
    toast("Nutrition label form cleared.");
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
    setProductScaleBasis(parsed.servingSize || valueOf(elements.customProductAmount), {
      calories: parsed.calories,
      protein_g: parsed.protein_g,
      carbs_g: parsed.carbs_g,
      fat_g: parsed.fat_g,
      fibre_g: parsed.fibre_g
    });
  }

  function parseNutritionText(text) {
    const cleanText = englishOnlyNutritionText(text);
    const lines = cleanText.split(/\n|;/).map((line) => line.trim()).filter(Boolean);
    const joined = lines.join("\n");
    const servingSize = extractServingSize(joined);
    const preferredColumn = preferredNutritionColumn(joined);
    const parsed = { servingSize };

    let sawSugarAfterCarbs = false;
    for (const line of lines) {
      let label = nutritionLabelForLine(line);
      if (!label || /per\s+100|%|nrv|vitamins?/i.test(label)) continue;
      if (/sugar/i.test(label) && parsed.carbs_g != null) {
        sawSugarAfterCarbs = true;
        continue;
      }
      if (!/^energy|^protein|carbohydrate|^carbs|fat|fib/i.test(label) && sawSugarAfterCarbs && parsed.fat_g == null && likelyMangledFatRow(line)) {
        label = "total fat";
      }

      if (/^energy\b/.test(label)) {
        if (parsed.calories == null) parsed.calories = energyCaloriesFromLine(line, preferredColumn);
      } else if (/^protein\b/.test(label) && parsed.protein_g == null) {
        parsed.protein_g = selectedNutrientValue(line, preferredColumn, "protein", servingSize);
      } else if (/^(glycaemic\s+)?carbohydrate\b|^carbs\b/.test(label) && parsed.carbs_g == null) {
        parsed.carbs_g = selectedNutrientValue(line, preferredColumn, "carbs", servingSize);
      } else if (/^(total\s+)?fat\b/.test(label) && parsed.fat_g == null && !/saturated|saurated|trans|polyunsaturated|monounsaturated|omega/i.test(label)) {
        parsed.fat_g = selectedNutrientValue(line, preferredColumn, "fat", servingSize);
      } else if (/^(dietary\s+)?fib(?:re|er)\b/.test(label) && parsed.fibre_g == null) {
        parsed.fibre_g = selectedNutrientValue(line, preferredColumn, "fibre", servingSize);
      }
    }

    if (servingSize) {
      parsed.sourceNote = `English rows only; values copied from ${preferredColumn === 1 ? "per-serving" : "first"} nutrition column (${servingSize}).`;
    } else {
      parsed.sourceNote = `English rows only; values copied from ${preferredColumn === 1 ? "per-serving" : "first"} nutrition column.`;
    }
    return parsed;
  }

  function structuredOcrTableText(data) {
    const wordRows = ocrWordRows(data);
    const lineRows = Array.isArray(data?.lines)
      ? data.lines.map((line) => String(line.text || "").trim()).filter(Boolean)
      : [];
    return [...lineRows, ...wordRows].filter(Boolean).join("\n");
  }

  function ocrWordRows(data) {
    const words = Array.isArray(data?.words) ? data.words.map(normaliseOcrWord).filter(Boolean) : [];
    if (!words.length) return [];
    const heights = words.map((word) => word.height).filter((height) => height > 0).sort((a, b) => a - b);
    const medianHeight = heights[Math.floor(heights.length / 2)] || 18;
    const threshold = Math.max(8, medianHeight * 0.8);
    const rows = [];

    words.sort((a, b) => a.y - b.y || a.x - b.x).forEach((word) => {
      let row = rows.find((candidate) => Math.abs(candidate.y - word.y) <= threshold);
      if (!row) {
        row = { y: word.y, words: [] };
        rows.push(row);
      }
      row.words.push(word);
      row.y = row.words.reduce((total, item) => total + item.y, 0) / row.words.length;
    });

    return rows
      .sort((a, b) => a.y - b.y)
      .map((row) => row.words.sort((a, b) => a.x - b.x).map((word) => word.text).join(" ").replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  function normaliseOcrWord(word) {
    const text = String(word?.text || "").trim();
    if (!text) return null;
    const box = word.bbox || word;
    const x0 = Number(box.x0 ?? box.left ?? word.x0);
    const y0 = Number(box.y0 ?? box.top ?? word.y0);
    const x1 = Number(box.x1 ?? (Number.isFinite(x0) ? x0 + Number(box.width || 0) : NaN));
    const y1 = Number(box.y1 ?? (Number.isFinite(y0) ? y0 + Number(box.height || 0) : NaN));
    if (![x0, y0, x1, y1].every(Number.isFinite)) return null;
    return {
      text,
      x: x0,
      y: (y0 + y1) / 2,
      height: Math.max(1, y1 - y0)
    };
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
    const normalised = String(line || "")
      .toLowerCase()
      .replace(/[^a-z0-9.<\s|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (/\benergy\b/.test(normalised)) return "energy";
    if (/\bprotein\b/.test(normalised)) return "protein";
    if (/glyca?emic\s+carbohydrate|\bcarbohydrate\b|\bcarbs\b/.test(normalised)) return "glycaemic carbohydrate";
    if (/\bsugar\b/.test(normalised)) return "sugar";
    if (/\bfib(?:re|er)\b|\bfibre\b|\bfiber\b/.test(normalised)) return "dietary fibre";
    if (/\bsaturated\b|saurated|\btrans\b|\bmono(?:un)?saturated\b|\bpoly(?:un)?saturated\b|\bomega\b/.test(normalised)) return normalised;
    if (/\btotal\s+fat\b|\bfat\b/.test(normalised)) return "total fat";
    const beforeValues = String(line || "").split(/\b(?:kj|kcal|calories|g|mg|µg|ug)\b|\d/i)[0] || "";
    return beforeValues
      .replace(/[^a-z\s-]/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function extractServingSize(text) {
    const source = String(text || "");
    const serving = source.match(/serving\s+size\s*(\d+(?:\.\d+)?)\s*(g|ml|mℓ|oz|cup|cups|slice|slices|serving)/i)
      || source.match(/(\d{2,4})\s*(g|9)?\s*\[?\s*per\s+serving/i)
      || String(text || "").match(/per\s+serving\s*(\d+(?:\.\d+)?)\s*(g|ml|mℓ|oz|cup|cups|slice|slices)/i)
      || String(text || "").match(/per\s*(\d+(?:\.\d+)?)\s*(g|ml|mℓ|oz|cup|cups|slice|slices)\s*(?:serving)?/i);
    return serving ? `${normalisedServingAmount(serving[1])} ${normalisedServingUnit(serving[2])}` : "";
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

  function selectedNutrientValue(line, preferredColumn, nutrient, servingSize) {
    const values = nutritionNumbers(nutrientNumberText(line, nutrient));
    let value = pickColumnValue(values, preferredColumn);
    if (value == null) return null;
    value = repairOcrDecimalValue(line, values, value, preferredColumn, nutrient, servingSize);
    return round(value);
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

  function nutrientNumberText(line, nutrient) {
    const text = String(line || "");
    const patterns = {
      protein: /protein/i,
      carbs: /glyca?emic\s+carbohydrate|carbohydrate|carbs/i,
      fat: /total\s+fat|fat/i,
      fibre: /fib(?:re|er)|fibre|fiber/i
    };
    const pattern = patterns[nutrient];
    if (!pattern) return text;
    const match = text.match(pattern);
    return match?.index != null ? text.slice(match.index) : text;
  }

  function likelyMangledFatRow(line) {
    const lower = String(line || "").toLowerCase();
    if (/satur|trans|mono|poly|omega|cholesterol|sodium|calcium|fib|sugar|protein|carbohydrate|energy/.test(lower)) return false;
    return nutritionNumbers(line).length >= 2;
  }

  function repairOcrDecimalValue(line, values, value, preferredColumn, nutrient, servingSize) {
    const text = String(line || "");
    if (/\./.test(text)) return value;
    if (nutrient === "fat" && value >= 10 && value < 100) {
      return value / 10;
    }
    if (nutrient === "fibre" && /</.test(text) && preferredColumn === 1 && values[0] >= 10 && value < 10) {
      const servingGrams = servingGramsFromText(servingSize);
      return servingGrams ? (values[0] / 10) * (servingGrams / 100) : value / 10;
    }
    return value;
  }

  function normalisedServingAmount(rawValue) {
    let amount = numberFromValue(rawValue);
    const compact = String(rawValue || "").replace(/\D/g, "");
    if (amount >= 1000 && /9$/.test(compact)) {
      amount = Math.floor(amount / 10);
    }
    return round(amount);
  }

  function normalisedServingUnit(rawUnit) {
    const unit = String(rawUnit || "g").toLowerCase();
    if (unit === "9") return "g";
    return unit.replace("mℓ", "ml");
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
    const habitGroups = [
      { title: "How the challenge works", items: DATA.daily_guidelines.slice(0, 3) },
      { title: "Daily habits", items: DATA.daily_guidelines.slice(3, 9) },
      { title: "Treats and drinks", items: DATA.daily_guidelines.slice(9, 14) },
      { title: "Protein and snacks", items: DATA.daily_guidelines.slice(14) }
    ];
    const instructionGroups = [
      { title: "Meal plan instructions", items: DATA.meal_plan_instructions.slice(0, 3) },
      { title: "Food weighing: raw vs cooked", items: DATA.meal_plan_instructions.slice(3, 5) },
      { title: "Swaps", items: DATA.meal_plan_instructions.slice(5, 7) },
      { title: "Drinks allowed", items: DATA.meal_plan_instructions.slice(7, 8) },
      { title: "Snack guide", items: DATA.meal_plan_instructions.slice(8, 9) },
      { title: "Photo guide", items: DATA.photo_guidelines },
      { title: "Flexible Sunday", items: ["Sunday is flexible. Choose meals that still support your goal, use leftovers, repeat a favourite meal, or add your own meal. Tracking is optional today."] }
    ];
    elements.rulesList.innerHTML = habitGroups.map(learnCardHtml).join("");
    elements.instructionsList.innerHTML = instructionGroups.map(learnCardHtml).join("");
  }

  function learnCardHtml(group) {
    return `
      <details class="rule-card learn-card">
        <summary>${escapeHtml(group.title)}</summary>
        <ul>
          ${(group.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </details>
    `;
  }

  function renderStats() {
    const selectedShopping = aggregateShopping("selected");
    const needCount = selectedShopping.filter((item) => ingredientStatus(item.item) === "Need to buy").length;
    const dailyPercent = dailyRulesPercent(state.activeWeek, state.todayDay);
    const workoutCount = completedWorkoutDaysForWeek();
    const todayTotals = sumMacros(selectedMealsForDay(state.todayDay));
    const targets = currentMacroTargets();

    const customCount = (state.customIngredients?.length || 0) + (state.customProducts?.length || 0) + (state.customMeals?.length || 0);
    elements.statMeals.textContent = `${pdfRecipes.length}${customCount ? ` + ${customCount}` : ""}`;
    elements.statShopping.textContent = needCount;
    elements.statRules.textContent = `${dailyPercent}%`;
    elements.statWorkouts.textContent = `${workoutCount}/3`;
    if (elements.statTodayCalories) {
      elements.statTodayCalories.textContent = `${Math.round(todayTotals.calories)}/${Math.round(targets.calories)}`;
    }
  }

  function aggregateShopping(scope) {
    const included = recipesForShoppingScope(scope);
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

  function recipesForShoppingScope(scope) {
    if (scope === "all") return recipes;
    if (scope === "today") return selectedMealsForDay(state.todayDay);
    if (scope === "next3") return selectedRecipesForDays(nextPlanDays(state.todayDay, 3));
    return selectedRecipesForWeek();
  }

  function selectedRecipesForDays(days) {
    const selected = [];
    for (const day of days) {
      ensurePlanDay(state.activeWeek, day);
      const dayPlan = state.plan[state.activeWeek][day] || {};
      for (const slot of SLOTS) {
        const recipe = recipeByName.get(dayPlan[slot.key]);
        if (recipe) selected.push(scaledRecipeForSlot(day, slot.key) || recipe);
      }
    }
    return selected;
  }

  function nextPlanDays(startDay, count) {
    const startIndex = Math.max(0, DAYS.indexOf(startDay));
    return Array.from({ length: count }, (_, index) => DAYS[(startIndex + index) % DAYS.length]);
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

  function selectedRecipesForWeek() {
    const selected = [];
    const weekPlan = state.plan[state.activeWeek] || {};
    for (const day of DAYS) {
      const dayPlan = weekPlan[day] || {};
      for (const slot of SLOTS) {
        const recipe = recipeByName.get(dayPlan[slot.key]);
        if (recipe) selected.push(scaledRecipeForSlot(day, slot.key) || recipe);
      }
    }
    return selected;
  }

  function selectedMealsForDay(day) {
    ensurePlanDay(state.activeWeek, day);
    const dayPlan = state.plan[state.activeWeek][day] || {};
    return SLOTS.map((slot) => {
      const recipe = recipeByName.get(dayPlan[slot.key]);
      return recipe ? scaledRecipeForSlot(day, slot.key) : null;
    }).filter(Boolean);
  }

  function scaledRecipeForSlot(day, slotKey) {
    ensurePlanDay(state.activeWeek, day);
    const recipe = recipeByName.get(state.plan[state.activeWeek][day]?.[slotKey]);
    if (!recipe) return null;
    return scaleRecipe(recipe, servingFactor(recipe, servingValue(day, slotKey)));
  }

  function servingValue(day, slotKey) {
    return state.servings?.[servingKey(state.activeWeek, day, slotKey)] || "";
  }

  function servingKey(week, day, slotKey) {
    return `${week}|${day}|${slotKey}`;
  }

  function servingPlaceholder(recipe) {
    const base = recipe.servings || recipe.ingredients?.[0]?.amount || "1 serving";
    return base && base !== "1" ? `default ${base}` : "e.g. 50%, 0.5 serving, 40 g";
  }

  function servingDefaultText(recipe) {
    return recipe.servings || recipe.ingredients?.[0]?.amount || "default";
  }

  function servingFactor(recipe, servingText) {
    const text = String(servingText || "").trim().toLowerCase();
    if (!text) return 1;
    const percent = text.match(/(\d+(?:[.,]\d+)?)\s*%/);
    if (percent) return positiveFactor(numberFromValue(percent[1]) / 100);
    const multiplier = text.match(/(\d+(?:[.,]\d+)?)\s*x/);
    if (multiplier) return positiveFactor(numberFromValue(multiplier[1]));
    const serving = text.match(/(\d+(?:[.,]\d+)?)\s*(serving|servings|portion|portions)/);
    if (serving) return positiveFactor(numberFromValue(serving[1]));
    const targetGrams = servingGramsFromText(text);
    const baseGrams = recipeServingGrams(recipe);
    if (targetGrams && baseGrams) return positiveFactor(targetGrams / baseGrams);
    const plainNumber = numberFromValue(text);
    if (plainNumber > 0 && baseGrams && plainNumber > 10) return positiveFactor(plainNumber / baseGrams);
    if (plainNumber > 0 && plainNumber <= 10) return positiveFactor(plainNumber);
    return 1;
  }

  function positiveFactor(value) {
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  function recipeServingGrams(recipe) {
    return servingGramsFromText(recipe.servings) || servingGramsFromText(recipe.ingredients?.[0]?.amount);
  }

  function scaleRecipe(recipe, factor) {
    const safeFactor = positiveFactor(factor);
    if (safeFactor === 1) return recipe;
    return {
      ...recipe,
      calories: round((Number(recipe.calories) || 0) * safeFactor),
      protein_g: round((Number(recipe.protein_g) || 0) * safeFactor),
      carbs_g: round((Number(recipe.carbs_g) || 0) * safeFactor),
      fat_g: round((Number(recipe.fat_g) || 0) * safeFactor),
      fibre_g: round((Number(recipe.fibre_g) || 0) * safeFactor),
      ingredients: (recipe.ingredients || []).map((ingredient) => ({
        ...ingredient,
        amount: scaledAmountText(ingredient.amount, safeFactor),
        calories: round((Number(ingredient.calories) || 0) * safeFactor),
        protein_g: round((Number(ingredient.protein_g) || 0) * safeFactor),
        carbs_g: round((Number(ingredient.carbs_g) || 0) * safeFactor),
        fat_g: round((Number(ingredient.fat_g) || 0) * safeFactor),
        fibre_g: round((Number(ingredient.fibre_g) || 0) * safeFactor)
      }))
    };
  }

  function scaledAmountText(amount, factor) {
    const text = String(amount || "");
    const match = text.match(/(\d+(?:[.,]\d+)?)\s*(g|gram|grams|ml|mℓ)/i);
    if (!match) return text;
    return text.replace(match[0], `${round(numberFromValue(match[1]) * factor)} ${match[2]}`);
  }

  function dailyTotalsHtml(day) {
    const totals = sumMacros(selectedMealsForDay(day));
    const targets = currentMacroTargets();
    return `
      <div class="target-card ${calorieStatusClass(totals.calories)}">
        <div>
          <span class="stat-label">Daily calories</span>
          <strong>${Math.round(totals.calories)} / ${Math.round(targets.calories)} cal</strong>
        </div>
        <div class="target-meter" aria-hidden="true"><span style="width:${targetPercent(totals.calories, targets.calories)}%"></span></div>
        <div class="macro-row">
          <span class="macro">${calorieRemainingText(totals.calories)}</span>
          <span class="macro">${macroTargetText("Protein", totals.protein, targets.protein, "minimum")}</span>
          <span class="macro">${macroTargetText("Carbs", totals.carbs, targets.carbs, "limit")}</span>
          <span class="macro">${macroTargetText("Fat", totals.fat, targets.fat, "limit")}</span>
          <span class="macro">${macroTargetText("Fibre", totals.fibre || 0, targets.fibre, "minimum")}</span>
        </div>
      </div>
    `;
  }

  function todayWorkoutHtml(day) {
    const workoutDays = ["Monday", "Wednesday", "Friday"];
    if (!workoutDays.includes(day)) {
      return `
        <div class="gentle-card">
          <strong>Gentle movement day</strong>
          <p>There is no scheduled workout today. A walk, stretch, or easy movement is enough if your body feels up to it.</p>
        </div>
      `;
    }
    const phase = phaseForWeek(state.activeWeek);
    const workouts = DATA.workouts.filter((workout) => workout.phase === phase && workout.day === day);
    if (!workouts.length) {
      return `<div class="gentle-card"><strong>No workout found for today</strong><p>Check the Workouts tab for this week's plan.</p></div>`;
    }
    const allDone = workouts.every((workout) => workoutDone(workout));
    return `
      <div class="gentle-card ${allDone ? "done-card" : ""}">
        <strong>${escapeHtml(day)}: ${escapeHtml(workouts[0].focus)}</strong>
        <p>${escapeHtml(workouts[0].duration)}. Complete this workout when it suits you today.</p>
        <button class="ghost-button small-button" type="button" data-jump-view="workouts">${allDone ? "Review workout" : "Go to workout"}</button>
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
    const target = currentMacroTargets().calories;
    if (value > target) return "over-target";
    if (value >= target * 0.9) return "near-target";
    return "within-target";
  }

  function calorieRemainingText(calories) {
    const remaining = currentMacroTargets().calories - (Number(calories) || 0);
    if (remaining < 0) return `${Math.abs(Math.round(remaining))} cal over target`;
    return `${Math.round(remaining)} cal remaining`;
  }

  function macroTargetText(label, current, target, mode) {
    const used = round(Number(current) || 0);
    const goal = round(Number(target) || 0);
    if (!goal) return `${label}: ${used}g`;
    const difference = goal - used;
    if (mode === "minimum") {
      return difference > 0
        ? `${label}: ${used}/${goal}g, ${round(difference)}g to go`
        : `${label}: ${used}/${goal}g, target hit`;
    }
    return difference < 0
      ? `${label}: ${used}/${goal}g, ${round(Math.abs(difference))}g over`
      : `${label}: ${used}/${goal}g, ${round(difference)}g left`;
  }

  function targetPercent(current, target) {
    const safeTarget = Number(target) || 1;
    return Math.min(100, Math.round(((Number(current) || 0) / safeTarget) * 100));
  }

  function mealNameWithSource(recipe) {
    const badge = recipe.source === "Custom" || recipe.source === "Product" || recipe.source === "Ingredient"
      ? ` <span class="source-badge">${escapeHtml(sourceLabel(recipe))}</span>`
      : "";
    return `${escapeHtml(recipe.name)}${badge}`;
  }

  function sourceLabel(recipe) {
    if (recipe.source === "Custom") return "My custom meal";
    if (recipe.source === "Product") return "Packaged food";
    if (recipe.source === "Ingredient") return "Single ingredient";
    return "Plan meal";
  }

  function slotLabel(slotKey) {
    return SLOTS.find((slot) => slot.key === slotKey)?.label || "Meal";
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

  function macroPriorityHtml(recipe) {
    if (recipe.calories == null && recipe.protein_g == null) {
      return `<div class="macro-row"><span class="macro">Macros follow product instructions</span></div>`;
    }
    const secondary = [
      ["Carbs", recipe.carbs_g == null ? null : `${recipe.carbs_g}g`],
      ["Fat", recipe.fat_g == null ? null : `${recipe.fat_g}g`],
      ["Fibre", recipe.fibre_g == null ? null : `${recipe.fibre_g}g`]
    ].filter(([, value]) => value !== null && value !== "");
    return `
      <div class="macro-row primary-macros">
        ${recipe.calories == null ? "" : `<span class="macro">Cal: ${escapeHtml(Math.round(Number(recipe.calories) || 0))}</span>`}
        ${recipe.protein_g == null ? "" : `<span class="macro">Protein: ${escapeHtml(recipe.protein_g)}g</span>`}
      </div>
      ${secondary.length ? `
        <details class="nutrition-details">
          <summary>More nutrition</summary>
          <div class="macro-row secondary-macros">
            ${secondary.map(([label, value]) => `<span class="macro subtle-macro">${label}: ${escapeHtml(value)}</span>`).join("")}
          </div>
        </details>
      ` : ""}
    `;
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

  function visibleDailyChecks(day) {
    return DAILY_CHECKS.filter((check) => check && check.key && check.label);
  }

  function dailyCheckProgress(week, day) {
    const checks = visibleDailyChecks(day);
    const current = state.daily[dailyKey(week, day)] || {};
    const ticked = checks.filter((check) => current[check.key]).length;
    return { ticked, total: checks.length };
  }

  function dailyRulesPercent(week, day) {
    const progress = dailyCheckProgress(week, day);
    return progress.total ? Math.round((progress.ticked / progress.total) * 100) : 0;
  }

  function completedWorkoutDaysForWeek() {
    const phase = phaseForWeek(state.activeWeek);
    const days = ["Monday", "Wednesday", "Friday"];
    return days.filter((day) => {
      const workouts = DATA.workouts.filter((workout) => workout.phase === phase && workout.day === day);
      return workouts.length && workouts.every((workout) => workoutDone(workout));
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

  function workoutKey(workout, week = state.activeWeek) {
    return `${week}|${workout.phase}|${workout.day}|${workout.exercise}`;
  }

  function legacyWorkoutKey(workout) {
    return `${workout.phase}|${workout.day}|${workout.exercise}`;
  }

  function workoutDone(workout) {
    const currentKey = workoutKey(workout);
    if (Object.prototype.hasOwnProperty.call(state.workouts, currentKey)) {
      return Boolean(state.workouts[currentKey]);
    }
    return Boolean(state.workouts[legacyWorkoutKey(workout)]);
  }

  function ensurePlanDay(week, day) {
    state.plan[week] = state.plan[week] || {};
    state.plan[week][day] = state.plan[week][day] || {};
    for (const slot of SLOTS) {
      state.plan[week][day][slot.key] = state.plan[week][day][slot.key] || "";
    }
  }

  function removeMealFromPlans(name) {
    for (const [week, weekPlan] of Object.entries(state.plan || {})) {
      for (const [day, dayPlan] of Object.entries(weekPlan || {})) {
        for (const slot of SLOTS) {
          if (dayPlan[slot.key] === name) {
            dayPlan[slot.key] = "";
            delete state.servings?.[servingKey(week, day, slot.key)];
          }
        }
      }
    }
  }

  function replaceMealInPlans(oldName, newName) {
    if (!oldName || !newName || oldName === newName) return;
    for (const weekPlan of Object.values(state.plan || {})) {
      for (const dayPlan of Object.values(weekPlan || {})) {
        for (const slot of SLOTS) {
          if (dayPlan[slot.key] === oldName) dayPlan[slot.key] = newName;
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

  function uniqueIngredientName(name) {
    const trimmed = name.trim();
    if (!recipeByName.has(trimmed)) return trimmed;
    let candidate = `${trimmed} - ingredient`;
    let index = 2;
    while (recipeByName.has(candidate)) {
      candidate = `${trimmed} - ingredient ${index}`;
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
    if (elements.customIngredientCategory) elements.customIngredientCategory.value = "Protein";
    if (elements.customIngredientSource) elements.customIngredientSource.value = "PDF ingredient list";
    if (elements.customIngredientVerified) elements.customIngredientVerified.checked = false;
    state.nutritionLookup.ingredientScaleBasis = null;
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
    if (elements.mealIngredientCategory) elements.mealIngredientCategory.value = "Protein";
    if (elements.mealIngredientSource) elements.mealIngredientSource.value = "PDF ingredient list";
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
    const scope = state.showAllShopping ? "all" : (state.shoppingRange || "next3");
    const items = aggregateShopping(scope).filter((item) => ingredientStatus(item.item) === "Need to buy");
    const text = items.length
      ? items.map((item) => `- ${item.item} (${item.category}) - ${item.amounts.join("; ")} - used in ${item.usedIn.join("; ")}`).join("\n")
      : "No shopping items in this view yet.";

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

  function memberModeEnabled() {
    return Boolean(
      MEMBER_CONFIG.enabled &&
      MEMBER_CONFIG.supabaseUrl &&
      MEMBER_CONFIG.supabaseAnonKey
    );
  }

  async function setupMemberAccess() {
    renderMemberGateCopy();
    if (!memberModeEnabled()) {
      document.body.classList.remove("member-locked");
      elements.memberGate.hidden = true;
      elements.memberBadge.hidden = true;
      elements.headerMemberSignOut.hidden = true;
      return;
    }
    if (!window.supabase?.createClient) {
      lockMemberScreen("Member login could not load. Check the internet connection and refresh the app.", { showAuth: false });
      return;
    }
    memberClient = window.supabase.createClient(MEMBER_CONFIG.supabaseUrl, MEMBER_CONFIG.supabaseAnonKey);
    lockMemberScreen("Checking member access...", { showAuth: false });
    const { data } = await memberClient.auth.getSession();
    currentMemberUser = data?.session?.user || null;
    await checkMemberAccess(currentMemberUser);
    memberClient.auth.onAuthStateChange((_event, session) => {
      currentMemberUser = session?.user || null;
      checkMemberAccess(currentMemberUser);
    });
  }

  function renderMemberGateCopy() {
    const appName = MEMBER_CONFIG.appName || "nutri-SCULPT Member App";
    const price = MEMBER_CONFIG.priceLabel || "R99/month";
    const title = elements.memberGate?.querySelector("h1");
    const eyebrow = elements.memberGate?.querySelector(".eyebrow");
    if (eyebrow) eyebrow.textContent = appName;
    if (title) title.textContent = "Member access";
    if (elements.memberGateText) {
      elements.memberGateText.textContent = `Sign in to use ${appName}. Only active paid users can access the full tracker.`;
    }
    if (elements.memberSubscribe) {
      elements.memberSubscribe.textContent = `Subscribe ${price}`;
    }
  }

  async function signInMember() {
    if (!memberClient) return;
    const email = valueOf(elements.memberEmail);
    const password = valueOf(elements.memberPassword);
    if (!email || !password) {
      setMemberStatus("Enter your email and password first.", "warning");
      return;
    }
    setMemberStatus("Signing in...", "neutral");
    const { data, error } = await memberClient.auth.signInWithPassword({ email, password });
    if (error) {
      setMemberStatus(error.message || "Could not sign in.", "warning");
      return;
    }
    currentMemberUser = data?.user || null;
    await checkMemberAccess(currentMemberUser);
  }

  async function signUpMember() {
    if (!memberClient) return;
    const email = valueOf(elements.memberEmail);
    const password = valueOf(elements.memberPassword);
    if (!email || !password) {
      setMemberStatus("Enter an email and password to create an account.", "warning");
      return;
    }
    if (password.length < 6) {
      setMemberStatus("Use a password with at least 6 characters.", "warning");
      return;
    }
    setMemberStatus("Creating account...", "neutral");
    const { data, error } = await memberClient.auth.signUp({ email, password });
    if (error) {
      setMemberStatus(error.message || "Could not create account.", "warning");
      return;
    }
    currentMemberUser = data?.session?.user || null;
    setMemberStatus("Account created. If asked, confirm the email, then sign in. Access unlocks after subscription is active.", "success");
    if (currentMemberUser) await checkMemberAccess(currentMemberUser);
  }

  async function signOutMember() {
    if (memberClient) {
      await memberClient.auth.signOut();
    }
    currentMemberUser = null;
    lockMemberScreen("Signed out. Sign in to use the member dashboard.", { showAuth: true });
  }

  async function checkMemberAccess(user) {
    if (!memberModeEnabled()) return true;
    if (!user) {
      lockMemberScreen("Sign in or create an account to continue.", { showAuth: true });
      return false;
    }
    setMemberStatus("Checking subscription...", "neutral");
    const { data, error } = await memberClient
      .from("member_access")
      .select("access_status, subscription_status, plan_name, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) {
      lockMemberScreen("Could not check access. Please try again or contact support.", { user, showAuth: false });
      setMemberStatus(error.message || "Access check failed.", "warning");
      return false;
    }
    if (memberProfileActive(data)) {
      unlockMemberScreen(user, data);
      return true;
    }
    lockMemberScreen("This account is not active yet. Subscribe, then tap Check access.", { user, showAuth: false });
    setMemberStatus("Subscription needed before the dashboard opens.", "warning");
    return false;
  }

  function memberProfileActive(profile) {
    const access = String(profile?.access_status || "").toLowerCase();
    const subscription = String(profile?.subscription_status || "").toLowerCase();
    return ["active", "trialing"].includes(access) || ["active", "trialing"].includes(subscription);
  }

  function unlockMemberScreen(user, profile) {
    document.body.classList.remove("member-locked");
    elements.memberGate.hidden = true;
    if (elements.memberBadge) {
      const plan = profile?.plan_name || MEMBER_CONFIG.priceLabel || "Active";
      elements.memberBadge.textContent = `${user.email} | ${plan}`;
      elements.memberBadge.hidden = false;
    }
    if (elements.headerMemberSignOut) elements.headerMemberSignOut.hidden = false;
    setMemberStatus("Member access active.", "success");
  }

  function lockMemberScreen(message, options = {}) {
    document.body.classList.add("member-locked");
    if (elements.memberGate) elements.memberGate.hidden = false;
    if (elements.memberAuthPanel) elements.memberAuthPanel.hidden = !options.showAuth;
    if (elements.memberLockedPanel) elements.memberLockedPanel.hidden = Boolean(options.showAuth);
    if (elements.memberLockedText) elements.memberLockedText.textContent = message;
    if (elements.memberLockedTitle) {
      elements.memberLockedTitle.textContent = options.user ? "Subscription needed" : "Sign in";
    }
    if (elements.memberSignOut) elements.memberSignOut.hidden = !options.user;
    if (elements.memberCheckAccess) elements.memberCheckAccess.hidden = !options.user;
    if (elements.memberBadge) elements.memberBadge.hidden = true;
    if (elements.headerMemberSignOut) elements.headerMemberSignOut.hidden = true;
    setMemberStatus(message, options.showAuth ? "neutral" : "warning");
  }

  function setMemberStatus(message, type = "neutral") {
    if (!elements.memberAccessStatus) return;
    elements.memberAccessStatus.textContent = message;
    elements.memberAccessStatus.classList.remove("warning", "success");
    if (type === "warning" || type === "success") {
      elements.memberAccessStatus.classList.add(type);
    }
  }

  function startMemberSubscription() {
    const email = currentMemberUser?.email || valueOf(elements.memberEmail);
    if (MEMBER_CONFIG.paystackPaymentUrl) {
      const url = new URL(MEMBER_CONFIG.paystackPaymentUrl, window.location.href);
      if (email) url.searchParams.set("email", email);
      window.open(url.toString(), "_blank", "noopener");
      setMemberStatus("Payment page opened. After payment, return here and tap Check access.", "success");
      return;
    }
    const support = MEMBER_CONFIG.supportEmail ? ` Contact ${MEMBER_CONFIG.supportEmail} for access.` : "";
    setMemberStatus(`Paystack payment link is not connected yet.${support}`, "warning");
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(`./service-worker.js?v=${APP_VERSION}`).then((registration) => {
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              showUpdateNotice(APP_VERSION);
            }
          });
        });
      }).catch(() => {
        // The dashboard still works if a browser blocks local service workers.
      });
    });
  }

  function setupInstallAndUpdateHelpers() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      if (elements.installStatus) {
        elements.installStatus.textContent = "This phone can install the app. Tap Install app when you are ready.";
      }
      if (elements.installApp) elements.installApp.hidden = false;
    });
    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      if (elements.installStatus) {
        elements.installStatus.textContent = "Installed. Open nutri-SCULPT from the phone home screen.";
      }
      toast("App added to this phone.");
    });
    renderPhoneHelp();
    window.addEventListener("load", () => {
      setTimeout(checkForNewAppVersion, 1600);
    });
  }

  function renderPhoneHelp() {
    const platform = phonePlatform();
    const androidSteps = [
      "Open this app link in Chrome.",
      "Tap the three dots in the top right.",
      "Tap Add to Home screen or Install app.",
      "Open nutri-SCULPT from the home screen next time."
    ];
    const iosSteps = [
      "Open this app link in Safari.",
      "Tap the Share button.",
      "Tap Add to Home Screen.",
      "Tap Add, then open nutri-SCULPT from the home screen."
    ];
    const firstSteps = platform === "ios" ? iosSteps : androidSteps;
    const secondTitle = platform === "ios" ? "Android/Samsung" : "iPhone";
    const secondSteps = platform === "ios" ? androidSteps : iosSteps;
    if (elements.installSteps) {
      elements.installSteps.innerHTML = `
        <div class="phone-help-card">
          <strong>${platform === "ios" ? "iPhone" : "Android/Samsung"}</strong>
          <ol>${firstSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        </div>
        <div class="phone-help-card">
          <strong>${escapeHtml(secondTitle)}</strong>
          <ol>${secondSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        </div>
      `;
    }
    if (elements.moveDataSteps) {
      elements.moveDataSteps.innerHTML = `
        <ol>
          <li>On the old phone or old link, open Settings and tap Copy backup text.</li>
          <li>Send that full text to the new phone, for example with WhatsApp.</li>
          <li>On this phone, open this public app link, go to Settings, tap Restore from text, paste it, then tap Restore pasted data.</li>
          <li>Tap Refresh app once. The meals, ticks, products and progress should appear on this phone.</li>
        </ol>
        <p>Saved data lives on each phone/browser. GitHub does not store your mom's private progress.</p>
      `;
    }
    if (elements.installStatus) {
      elements.installStatus.textContent = standaloneDisplay()
        ? "This app is already opening like a phone app."
        : "Add this app to the home screen so it opens like a normal app.";
    }
    if (elements.installApp && platform === "ios") {
      elements.installApp.hidden = true;
    }
  }

  function phonePlatform() {
    const agent = navigator.userAgent || "";
    const isiPad = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    if (/iPhone|iPad|iPod/i.test(agent) || isiPad) return "ios";
    if (/Android/i.test(agent)) return "android";
    return "desktop";
  }

  function standaloneDisplay() {
    return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
  }

  async function installAppToPhone() {
    if (!deferredInstallPrompt) {
      toast(phonePlatform() === "ios" ? "On iPhone, use Safari Share, then Add to Home Screen." : "Use your browser menu, then Add to Home screen or Install app.");
      return;
    }
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice.catch(() => null);
    deferredInstallPrompt = null;
    if (choice?.outcome === "accepted") {
      toast("Install started.");
    } else {
      toast("Install cancelled. The instructions stay here when you are ready.");
    }
  }

  async function checkForNewAppVersion() {
    try {
      const response = await fetch(`./app.js?version-check=${Date.now()}`, { cache: "no-store" });
      const text = await response.text();
      const match = text.match(/APP_VERSION\s*=\s*"([^"]+)"/);
      const latestVersion = match?.[1] || "";
      if (latestVersion && latestVersion !== APP_VERSION) {
        showUpdateNotice(latestVersion);
      }
    } catch {
      // The app can still work offline; update checks wait until a connection is available.
    }
  }

  function showUpdateNotice(version) {
    availableAppVersion = version || APP_VERSION;
    if (elements.updateNoticeText) {
      elements.updateNoticeText.textContent = `A new nutri-SCULPT version is available. Updating keeps your saved meals and ticks on this phone.`;
    }
    if (elements.updateNotice) elements.updateNotice.hidden = false;
  }

  function exportSavedDashboard() {
    const payload = buildSharePayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `nutri-sculpt-saved-data-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast("Dashboard backup saved.");
  }

  async function copySavedDashboardText() {
    const payload = buildSharePayload();
    const text = [
      "nutri-SCULPT saved dashboard data",
      "Open the app, tap Settings, tap Restore from text, paste this whole message, then tap Restore pasted data.",
      "",
      JSON.stringify(payload)
    ].join("\n");
    if (elements.shareImportText) {
      elements.shareImportText.value = text;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast("Backup text copied.");
        return;
      }
    } catch {
      // Fall through to the manual copy fallback.
    }
    elements.shareImportPanel.hidden = false;
    elements.shareImportText?.focus();
    elements.shareImportText?.select();
    toast("Copy the highlighted text and send it to your mom.");
  }

  function buildSharePayload() {
    const exportedState = JSON.parse(JSON.stringify(state));
    if (exportedState.nutritionLookup) {
      exportedState.nutritionLookup.usdaApiKey = "";
    }
    return {
      app: "nutri-sculpt-dashboard",
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      state: exportedState
    };
  }

  function importSavedDashboard(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importDashboardText(String(reader.result || "{}"));
      } catch {
        toast("Could not import that file.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function importPastedDashboard() {
    try {
      if (importDashboardText(valueOf(elements.shareImportText))) {
        if (elements.shareImportText) elements.shareImportText.value = "";
        if (elements.shareImportPanel) elements.shareImportPanel.hidden = true;
      }
    } catch {
      toast("Could not import that pasted text.");
    }
  }

  function importDashboardText(text) {
    const imported = parseSharedDashboardText(text);
    const importedState = imported.state || imported;
    if (!importedState || typeof importedState !== "object" || !importedState.plan) {
      throw new Error("Not a dashboard save file.");
    }
    if (!confirm("Import this saved dashboard? It will replace the saved data on this browser.")) {
      return false;
    }
    const savedUsdaApiKey = state.nutritionLookup?.usdaApiKey || valueOf(elements.usdaApiKey);
    state = mergeState(defaultState(), importedState);
    if (savedUsdaApiKey) {
      state.nutritionLookup.usdaApiKey = savedUsdaApiKey;
    }
    saveState();
    updateRecipeIndexes();
    initialiseControls();
    saveAndRender();
    toast("Saved dashboard imported.");
    return true;
  }

  function parseSharedDashboardText(text) {
    const trimmed = String(text || "").trim();
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    const jsonText = firstBrace >= 0 && lastBrace > firstBrace
      ? trimmed.slice(firstBrace, lastBrace + 1)
      : trimmed;
    return JSON.parse(jsonText);
  }

  async function updateAppFiles(version = APP_VERSION) {
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
      window.location.href = `${base}?v=${version || APP_VERSION}-${Date.now()}`;
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
