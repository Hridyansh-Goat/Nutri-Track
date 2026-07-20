/**
 * Nutri-Track - AI Diet Plan & Recommendation Engine (Client-Side)
 * Contains physiological calculators (BMR, TDEE, Macros) and NLP generators.
 */

// Food database definitions (used for recommendations and lookups)
const FOOD_RECOMMENDATIONS = {
  protein: [
    { name: "Grilled Chicken Breast", description: "Lean source of premium protein", calories: 165, protein: 31, carbs: 0, fats: 3.6, unit: "100g" },
    { name: "Greek Yogurt (Non-Fat)", description: "High-protein probiotic snack", calories: 59, protein: 10, carbs: 3.6, fats: 0.4, unit: "100g" },
    { name: "Egg Whites", description: "Pure protein, zero fat", calories: 52, protein: 11, carbs: 0.7, fats: 0.2, unit: "100g (approx. 3 eggs)" },
    { name: "Canned Tuna in Water", description: "Excellent high-protein quick meal", calories: 116, protein: 26, carbs: 0, fats: 1, unit: "100g" },
    { name: "Whey Protein Shake", description: "Fast-absorbing post-workout protein", calories: 120, protein: 24, carbs: 3, fats: 1.5, unit: "1 scoop" },
    { name: "Tofu (Firm)", description: "Plant-based complete protein", calories: 144, protein: 17, carbs: 3, fats: 8, unit: "100g" },
    { name: "Edamame", description: "Protein-rich green soybean pods", calories: 121, protein: 11.9, carbs: 8.9, fats: 5.2, unit: "100g" }
  ],
  carbs: [
    { name: "Oats (Steel-Cut)", description: "Complex, slow-digesting carbohydrates", calories: 389, protein: 16.9, carbs: 66, fats: 6.9, unit: "100g dry" },
    { name: "Banana", description: "Quick digestion, potassium-rich energy", calories: 89, protein: 1.1, carbs: 22.8, fats: 0.3, unit: "1 medium" },
    { name: "Sweet Potato", description: "Beta-carotene rich complex carb", calories: 86, protein: 1.6, carbs: 20, fats: 0.1, unit: "100g" },
    { name: "Brown Rice (Cooked)", description: "High-fiber stable energy source", calories: 112, protein: 2.6, carbs: 23, fats: 0.9, unit: "100g" },
    { name: "Blueberries", description: "Antioxidant-rich low calorie carbs", calories: 57, protein: 0.7, carbs: 14.5, fats: 0.3, unit: "100g" },
    { name: "Quinoa", description: "Nutritious seed with complete protein", calories: 120, protein: 4.4, carbs: 21.3, fats: 1.9, unit: "100g cooked" }
  ],
  fats: [
    { name: "Avocado", description: "Monounsaturated heart-healthy fats", calories: 160, protein: 2, carbs: 8.5, fats: 14.7, unit: "100g (approx. 1/2)" },
    { name: "Almonds", description: "Healthy fats, vitamin E, and fiber", calories: 579, protein: 21, carbs: 22, fats: 49, unit: "100g (approx. 1 handful is 30g)" },
    { name: "Chia Seeds", description: "Omega-3 rich super seed", calories: 486, protein: 16.5, carbs: 42.1, fats: 30.7, unit: "100g" },
    { name: "Extra Virgin Olive Oil", description: "Pure antioxidant fat source", calories: 884, protein: 0, carbs: 0, fats: 100, unit: "1 tbsp (14g)" },
    { name: "Walnuts", description: "Great for brain health and omega-3s", calories: 654, protein: 15, carbs: 14, fats: 65, unit: "100g" }
  ],
  lowCalorie: [
    { name: "Cucumber", description: "Extremely hydrating, near-zero calorie", calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, unit: "100g" },
    { name: "Celery Stalks", description: "High volume, crunchy fiber snack", calories: 16, protein: 0.7, carbs: 3, fats: 0.2, unit: "100g" },
    { name: "Spinach (Raw)", description: "Iron-rich, very low calorie volume builder", calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, unit: "100g" },
    { name: "Broccoli (Steamed)", description: "Micronutrient-dense high volume vegetable", calories: 35, protein: 2.4, carbs: 7, fats: 0.4, unit: "100g" }
  ],
  avoidFoods: {
    sugar: ["Sugary Sodas / Soft Drinks", "Pastries & Donuts", "Candy & Milk Chocolate", "Energy drinks", "Sugary Cereals"],
    sodium: ["Processed Potato Chips", "Canned/Instant Ramen", "Cured Deli Meats", "Soy Sauce in excess", "Fast-food Cheeseburgers"],
    fats: ["Deep Fried French Fries", "Heavy Butter/Margarine", "Pizza with extra cheese", "Mayonnaise-heavy dressings", "Fatty Cuts of Pork/Beef"],
    highCalorie: ["Ice Cream", "Cocktails / Alcohol", "Packaged Potato Chips", "Commercial Salad Dressings", "Milkshakes"]
  }
};

// Raw Meal Catalog used to construct diet plans
const MEAL_CATALOG = {
  Breakfast: [
    {
      name: "Avocado & Egg Whites Toast",
      recipe: "Toast 2 slices of whole wheat bread. Mash 50g avocado and spread. Top with 4 scrambled egg whites and a pinch of black pepper.",
      calories: 320, protein: 22, carbs: 28, fats: 12, tags: ["high-protein", "balanced"]
    },
    {
      name: "Protein Power Oatmeal",
      recipe: "Cook 50g steel-cut oats in water. Stir in 1 scoop of whey protein powder, 10g chia seeds, and top with 30g fresh blueberries.",
      calories: 380, protein: 30, carbs: 45, fats: 8, tags: ["high-protein", "muscle-gain"]
    },
    {
      name: "Greek Yogurt Parfait",
      recipe: "Layer 200g non-fat Greek yogurt, 30g low-sugar granola, and 50g mixed berries in a bowl. Drizzle 1 tsp honey.",
      calories: 280, protein: 24, carbs: 35, fats: 4, tags: ["weight-loss", "balanced"]
    },
    {
      name: "Tofu Scramble & Spinach Wrap",
      recipe: "Sauté 150g firm tofu with spinach, turmeric, and nutritional yeast. Roll into a whole wheat tortilla wrap.",
      calories: 310, protein: 18, carbs: 32, fats: 11, tags: ["vegetarian", "vegan", "balanced"]
    },
    {
      name: "Peanut Butter Banana Shake",
      recipe: "Blend 1 medium banana, 1.5 tbsp peanut butter, 1 cup unsweetened almond milk, and 1 scoop protein powder.",
      calories: 420, protein: 32, carbs: 38, fats: 16, tags: ["muscle-gain", "high-calorie"]
    }
  ],
  Lunch: [
    {
      name: "Quinoa Chicken Buddha Bowl",
      recipe: "Combine 120g grilled chicken breast, 100g cooked quinoa, 50g steamed broccoli, and 50g cherry tomatoes. Top with lemon dressing.",
      calories: 480, protein: 42, carbs: 46, fats: 9, tags: ["high-protein", "muscle-gain"]
    },
    {
      name: "Mediterranean Tuna Salad",
      recipe: "Mix 1 can drained tuna, mixed greens, cucumber, olives, 50g chickpeas, and 1 tsp olive oil with red wine vinegar.",
      calories: 350, protein: 32, carbs: 18, fats: 14, tags: ["weight-loss", "low-carb"]
    },
    {
      name: "Lentil & Vegetable Stew",
      recipe: "Simmer 100g brown lentils, carrots, celery, diced tomatoes, and spinach in vegetable broth. Serve with a small sourdough slice.",
      calories: 390, protein: 20, carbs: 58, fats: 3, tags: ["vegetarian", "vegan", "balanced"]
    },
    {
      name: "Turkey & Hummus Wrap",
      recipe: "Spread 2 tbsp hummus on a spinach tortilla. Add 100g smoked turkey breast slice, cucumber, spinach, and roll.",
      calories: 330, protein: 26, carbs: 28, fats: 10, tags: ["weight-loss", "balanced"]
    },
    {
      name: "Beef & Broccoli Stir-Fry",
      recipe: "Sauté 120g lean beef strips and 150g broccoli florets in 1 tsp sesame oil and low-sodium soy sauce. Serve over 100g brown rice.",
      calories: 460, protein: 34, carbs: 42, fats: 13, tags: ["muscle-gain", "balanced"]
    }
  ],
  Dinner: [
    {
      name: "Baked Salmon & Asparagus",
      recipe: "Bake 150g salmon fillet with dill and lemon juice. Roast 100g asparagus in 1 tsp olive oil. Serve with 100g boiled sweet potato.",
      calories: 490, protein: 36, carbs: 26, fats: 22, tags: ["high-protein", "balanced"]
    },
    {
      name: "Lemon Garlic Shrimp & Zucchini Noodles",
      recipe: "Sauté 150g shrimp in garlic and 1 tsp olive oil. Toss with spiralized zucchini noodles, cherry tomatoes, and parmesan.",
      calories: 290, protein: 32, carbs: 12, fats: 11, tags: ["weight-loss", "low-carb"]
    },
    {
      name: "Tempeh Sheet Pan Roast",
      recipe: "Roast 120g cubed tempeh, brussels sprouts, and butternut squash cubes tossed with olive oil, paprika, and salt.",
      calories: 410, protein: 24, carbs: 38, fats: 18, tags: ["vegetarian", "vegan", "balanced"]
    },
    {
      name: "Lean Beef Sirloin & Green Beans",
      recipe: "Grill 130g lean sirloin steak. Serve alongside steamed green beans and 100g mashed sweet potatoes.",
      calories: 450, protein: 38, carbs: 28, fats: 15, tags: ["muscle-gain", "high-protein"]
    },
    {
      name: "High-Protein Vegetarian Chilli",
      recipe: "Simmer black beans, kidney beans, textured vegetable protein (TVP), bell peppers, onions, and canned tomatoes with chili spice.",
      calories: 380, protein: 25, carbs: 54, fats: 4, tags: ["vegetarian", "vegan", "balanced"]
    }
  ],
  Snack: [
    {
      name: "Apple & Almond Butter",
      recipe: "Slice 1 crisp apple and serve with 1 tbsp (16g) almond butter.",
      calories: 180, protein: 4, carbs: 22, fats: 9, tags: ["balanced", "vegetarian"]
    },
    {
      name: "Cottage Cheese & Pineapple",
      recipe: "Mix 150g low-fat cottage cheese with 50g pineapple chunks.",
      calories: 140, protein: 18, carbs: 12, fats: 2, tags: ["weight-loss", "high-protein"]
    },
    {
      name: "Mixed Nuts & Dark Chocolate",
      recipe: "Combine 20g almonds/walnuts and 1 square (10g) 85% dark chocolate.",
      calories: 175, protein: 4, carbs: 10, fats: 14, tags: ["muscle-gain", "balanced"]
    },
    {
      name: "Hummus & Cucumber Sticks",
      recipe: "Serve 3 tbsp (45g) hummus with 1 full cucumber cut into spears.",
      calories: 120, protein: 4, carbs: 14, fats: 6, tags: ["vegan", "weight-loss", "low-carb"]
    },
    {
      name: "Hard Boiled Eggs",
      recipe: "Boil 2 large eggs. Sprinkle with salt and pepper.",
      calories: 140, protein: 12, carbs: 1, fats: 10, tags: ["low-carb", "high-protein"]
    }
  ]
};

// Complete Weekly Day Names
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Perform health vitals mathematical calculations
 */
export function calculateVitals(profile) {
  const { weight, height, age, gender, activity, goal } = profile;
  
  // Mifflin-St Jeor Equation for Basal Metabolic Rate (BMR)
  let bmr = 0;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Total Daily Energy Expenditure (TDEE) based on activity multiplier
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9
  };
  const multiplier = multipliers[activity] || 1.2;
  const tdee = Math.round(bmr * multiplier);
  
  // Determine target calories based on goal
  let targetCalories = tdee;
  if (goal === "lose-fast") targetCalories = tdee - 500;
  else if (goal === "lose-mild") targetCalories = tdee - 250;
  else if (goal === "gain-mild") targetCalories = tdee + 250;
  else if (goal === "gain-fast") targetCalories = tdee + 500;
  
  // Safety boundary
  if (targetCalories < 1200) targetCalories = 1200;
  
  // Determine macro splits
  let pRatio, cRatio, fRatio; // Proportions of calories
  if (goal.includes("gain")) {
    // Muscle gain: High protein, high carb
    pRatio = 0.30;
    cRatio = 0.45;
    fRatio = 0.25;
  } else if (goal.includes("lose")) {
    // Weight loss: Higher protein, lower carbs to retain muscle and control hunger
    pRatio = 0.35;
    cRatio = 0.35;
    fRatio = 0.30;
  } else {
    // Balanced maintenance
    pRatio = 0.25;
    cRatio = 0.50;
    fRatio = 0.25;
  }
  
  // Grams: 1g Protein = 4kcal, 1g Carb = 4kcal, 1g Fat = 9kcal
  const targetProtein = Math.round((targetCalories * pRatio) / 4);
  const targetCarbs = Math.round((targetCalories * cRatio) / 4);
  const targetFats = Math.round((targetCalories * fRatio) / 9);
  
  return {
    bmr: Math.round(bmr),
    tdee: tdee,
    calories: Math.round(targetCalories),
    protein: targetProtein,
    carbs: targetCarbs,
    fats: targetFats
  };
}

/**
 * Generate a 7-day personalized diet plan with shopping list
 */
export function generateDietPlan(profile, vitals) {
  const plan = {};
  const isVegan = profile.dietType === "vegan";
  const isVegetarian = profile.dietType === "vegetarian" || isVegan;
  const isHighProtein = profile.goal.includes("gain") || profile.goal.includes("lose");
  
  // Helper to filter meal catalog by tags
  const getMealsForCategory = (category) => {
    let list = MEAL_CATALOG[category];
    
    // Apply vegan/vegetarian filter
    if (isVegan) {
      list = list.filter(m => m.tags.includes("vegan"));
    } else if (isVegetarian) {
      list = list.filter(m => m.tags.includes("vegetarian") || m.tags.includes("vegan"));
    }
    
    // Sort so goal-aligned meals come first if possible
    list.sort((a, b) => {
      const matchA = isHighProtein ? a.tags.includes("high-protein") : a.tags.includes("balanced");
      const matchB = isHighProtein ? b.tags.includes("high-protein") : b.tags.includes("balanced");
      return matchB - matchA; // True (1) before False (0)
    });
    
    return list.length > 0 ? list : MEAL_CATALOG[category]; // Fallback to avoid empty
  };

  const breakfastList = getMealsForCategory("Breakfast");
  const lunchList = getMealsForCategory("Lunch");
  const dinnerList = getMealsForCategory("Dinner");
  const snackList = getMealsForCategory("Snack");

  // Construct weekly schedule
  DAYS_OF_WEEK.forEach((day, index) => {
    // Choose meals by cycling through the catalog to ensure variety each day
    const breakfast = breakfastList[index % breakfastList.length];
    const lunch = lunchList[(index + 1) % lunchList.length];
    const dinner = dinnerList[(index + 2) % dinnerList.length];
    const snack = snackList[(index + 3) % snackList.length];
    
    // Scale meal portion slightly to match user target calories
    const totalMealBaseCals = breakfast.calories + lunch.calories + dinner.calories + snack.calories;
    const scalingFactor = vitals.calories / totalMealBaseCals;
    
    const scaleMeal = (meal) => {
      return {
        name: meal.name,
        recipe: meal.recipe,
        calories: Math.round(meal.calories * scalingFactor),
        protein: Math.round(meal.protein * scalingFactor),
        carbs: Math.round(meal.carbs * scalingFactor),
        fats: Math.round(meal.fats * scalingFactor),
        portionScale: Math.round(scalingFactor * 100) // Percentage scale description
      };
    };

    plan[day] = {
      Breakfast: scaleMeal(breakfast),
      Lunch: scaleMeal(lunch),
      Dinner: scaleMeal(dinner),
      Snack: scaleMeal(snack),
      totals: {
        calories: Math.round(vitals.calories),
        protein: Math.round(vitals.protein),
        carbs: Math.round(vitals.carbs),
        fats: Math.round(vitals.fats)
      }
    };
  });

  // Compile Grocery List
  const groceryItems = new Set();
  const rawIngredients = {
    "Avocado & Egg Whites Toast": ["Whole wheat bread", "Avocados", "Eggs (whites)", "Black pepper"],
    "Protein Power Oatmeal": ["Steel-cut oats", "Whey protein powder", "Chia seeds", "Fresh blueberries"],
    "Greek Yogurt Parfait": ["Greek yogurt (non-fat)", "Low-sugar granola", "Mixed berries", "Honey"],
    "Tofu Scramble & Spinach Wrap": ["Firm tofu", "Fresh spinach", "Turmeric powder", "Nutritional yeast", "Whole wheat tortilla wraps"],
    "Peanut Butter Banana Shake": ["Bananas", "Peanut butter", "Unsweetened almond milk", "Whey protein powder"],
    "Quinoa Chicken Buddha Bowl": ["Chicken breast", "Quinoa", "Fresh broccoli", "Cherry tomatoes", "Lemons"],
    "Mediterranean Tuna Salad": ["Canned tuna (in water)", "Mixed salad greens", "Cucumbers", "Black olives", "Canned chickpeas", "Olive oil", "Red wine vinegar"],
    "Lentil & Vegetable Stew": ["Brown lentils", "Carrots", "Celery", "Diced canned tomatoes", "Fresh spinach", "Sourdough bread"],
    "Turkey & Hummus Wrap": ["Hummus", "Spinach tortillas", "Sliced turkey breast", "Cucumbers", "Fresh spinach"],
    "Beef & Broccoli Stir-Fry": ["Lean beef strips", "Fresh broccoli", "Sesame oil", "Low-sodium soy sauce", "Brown rice"],
    "Baked Salmon & Asparagus": ["Salmon fillets", "Fresh asparagus", "Fresh dill", "Lemons", "Sweet potatoes"],
    "Lemon Garlic Shrimp & Zucchini Noodles": ["Shrimp", "Garlic cloves", "Olive oil", "Zucchini", "Cherry tomatoes", "Parmesan cheese"],
    "Tempeh Sheet Pan Roast": ["Tempeh", "Brussels sprouts", "Butternut squash", "Olive oil", "Smoked paprika"],
    "Lean Beef Sirloin & Green Beans": ["Lean sirloin steak", "Green beans", "Sweet potatoes"],
    "High-Protein Vegetarian Chilli": ["Black beans", "Kidney beans", "Textured vegetable protein (TVP)", "Bell peppers", "Onions", "Canned tomatoes", "Chili powder"],
    "Apple & Almond Butter": ["Apples", "Almond butter"],
    "Cottage Cheese & Pineapple": ["Low-fat cottage cheese", "Canned/fresh pineapple chunks"],
    "Mixed Nuts & Dark Chocolate": ["Mixed almonds & walnuts", "85% dark chocolate"],
    "Hummus & Cucumber Sticks": ["Hummus", "Cucumbers"],
    "Hard Boiled Eggs": ["Eggs", "Sea salt"]
  };

  // Traverse plan meals and aggregate ingredients
  Object.values(plan).forEach(day => {
    ["Breakfast", "Lunch", "Dinner", "Snack"].forEach(mealType => {
      const mealName = day[mealType].name;
      const ingredients = rawIngredients[mealName] || [mealName];
      ingredients.forEach(item => groceryItems.add(item));
    });
  });

  return {
    schedule: plan,
    groceryList: Array.from(groceryItems).map((item, index) => ({ id: index, name: item, checked: false }))
  };
}

/**
 * Local Intelligent AI Engine - Food Intake Live Evaluator & Coach
 * Compares current logged items with targets and gives high fidelity recommendations.
 */
export function analyzeFoodLog(dailyLogs, vitals) {
  // Aggregate today's food metrics
  const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
  dailyLogs.forEach(food => {
    totals.calories += Number(food.calories || 0);
    totals.protein += Number(food.protein || 0);
    totals.carbs += Number(food.carbs || 0);
    totals.fats += Number(food.fats || 0);
  });
  
  // Round aggregated values
  totals.calories = Math.round(totals.calories);
  totals.protein = Math.round(totals.protein);
  totals.carbs = Math.round(totals.carbs);
  totals.fats = Math.round(totals.fats);

  // Compute percentage progress relative to vitals target
  const pct = {
    calories: Math.min(Math.round((totals.calories / vitals.calories) * 100), 200),
    protein: Math.min(Math.round((totals.protein / vitals.protein) * 100), 200),
    carbs: Math.min(Math.round((totals.carbs / vitals.carbs) * 100), 200),
    fats: Math.min(Math.round((totals.fats / vitals.fats) * 100), 200)
  };

  // Determine what macro deficiency is largest
  const remaining = {
    calories: Math.max(vitals.calories - totals.calories, 0),
    protein: Math.max(vitals.protein - totals.protein, 0),
    carbs: Math.max(vitals.carbs - totals.carbs, 0),
    fats: Math.max(vitals.fats - totals.fats, 0)
  };

  const eatSuggestions = [];
  const avoidSuggestions = [];
  let aiToneFeedback = "";

  // 1. Core Logic to build suggestions
  const caloriesExceeded = totals.calories >= vitals.calories;
  const caloriesClose = totals.calories >= (vitals.calories - 200) && !caloriesExceeded;

  if (caloriesExceeded) {
    // Calorie cap reached
    eatSuggestions.push(...FOOD_RECOMMENDATIONS.lowCalorie.slice(0, 3));
    avoidSuggestions.push(...FOOD_RECOMMENDATIONS.avoidFoods.highCalorie.slice(0, 3));
    avoidSuggestions.push("Any snacks above 100 calories");
    
    aiToneFeedback = "You have met or exceeded your daily caloric threshold. Keep additional intake focused strictly on high-volume, low-density foods like cucumbers, celery, or warm herbal teas. Avoid dense fats (like nuts/oils) and high sugars for the rest of the evening.";
  } else {
    // Still have calories to spare
    // Check what is most depleted based on percentages
    const macroPercentages = [
      { name: 'protein', pct: pct.protein, list: FOOD_RECOMMENDATIONS.protein },
      { name: 'carbs', pct: pct.carbs, list: FOOD_RECOMMENDATIONS.carbs },
      { name: 'fats', pct: pct.fats, list: FOOD_RECOMMENDATIONS.fats }
    ];
    
    // Sort from lowest percentage completed to highest
    macroPercentages.sort((a, b) => a.pct - b.pct);
    const mostDeficient = macroPercentages[0];
    const secondDeficient = macroPercentages[1];
    
    // Recommend items from the lowest macro category
    eatSuggestions.push(...mostDeficient.list.slice(0, 2));
    // Toss in a recommendation from second lowest
    eatSuggestions.push(secondDeficient.list[0]);
    
    // Avoid advice logic based on high items
    if (pct.carbs > 85) {
      avoidSuggestions.push(...FOOD_RECOMMENDATIONS.avoidFoods.sugar.slice(0, 2));
      avoidSuggestions.push("White bread / Jasmine Rice");
    }
    if (pct.fats > 85) {
      avoidSuggestions.push(...FOOD_RECOMMENDATIONS.avoidFoods.fats.slice(0, 2));
      avoidSuggestions.push("Butter & Heavy Cream");
    }
    if (avoidSuggestions.length === 0) {
      // General healthy warnings if no macros are overloaded
      avoidSuggestions.push(...FOOD_RECOMMENDATIONS.avoidFoods.sugar.slice(0, 1));
      avoidSuggestions.push(...FOOD_RECOMMENDATIONS.avoidFoods.sodium.slice(0, 1));
      avoidSuggestions.push(...FOOD_RECOMMENDATIONS.avoidFoods.highCalorie.slice(0, 1));
    }

    // Formulate intelligent AI conversational summary
    if (mostDeficient.name === 'protein' && remaining.protein > 15) {
      aiToneFeedback = `Your protein intake is currently behind (${totals.protein}g / ${vitals.protein}g). To hit your goals and maintain lean mass, prioritize a high-protein source next. Great choices would be ${eatSuggestions[0].name} or ${eatSuggestions[1].name}. Avoid heavy simple-carbohydrate meals to keep insulin stable.`;
    } else if (mostDeficient.name === 'carbs' && remaining.carbs > 20) {
      aiToneFeedback = `Your body is primed for carbohydrates right now (${totals.carbs}g of ${vitals.carbs}g consumed). To replenish muscle glycogen and boost energy levels, consume complex carbs like ${eatSuggestions[0].name}. Try to avoid processed simple sugars that lead to crashes.`;
    } else if (mostDeficient.name === 'fats' && remaining.fats > 10) {
      aiToneFeedback = `Healthy lipids are your lowest macronutrient score today. Consuming essential fatty acids helps with hormone production and nutrient absorption. Consider adding ${eatSuggestions[0].name} to your next snack. Minimize trans fats and processed snacks.`;
    } else {
      // Well balanced tracking
      aiToneFeedback = `Excellent tracking today! Your macro ratios are highly balanced. You have about ${remaining.calories} kcal remaining. A light, nutritious snack like ${eatSuggestions[0].name} or a few ${eatSuggestions[1].name} will help you finish the day perfectly aligned.`;
    }
  }

  // Double check that we don't have blank values
  return {
    totals,
    pct,
    remaining,
    eat: eatSuggestions,
    avoid: avoidSuggestions.map(name => typeof name === 'string' ? { name } : name),
    feedback: aiToneFeedback
  };
}
