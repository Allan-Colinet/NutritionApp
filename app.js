// Initialisation des données
let userData = {
  weights: [],
  foods: [],
  meals: [],
};

// Chargement des données depuis localStorage
function loadData() {
  const storedData = localStorage.getItem("nutritionAppData");
  if (storedData) {
    userData = JSON.parse(storedData);
  } else {
    // Données par défaut pour la démo
    userData.foods = [
      { id: 1, name: "Pomme", calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      {
        id: 2,
        name: "Poulet (filet)",
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
      },
      {
        id: 3,
        name: "Riz blanc cuit",
        calories: 130,
        protein: 2.7,
        carbs: 28,
        fat: 0.3,
      },
      {
        id: 4,
        name: "Yaourt nature",
        calories: 59,
        protein: 3.5,
        carbs: 4.7,
        fat: 3.3,
      },
    ];
    saveData();
  }
  renderDashboard();
}

// Sauvegarde des données dans localStorage
function saveData() {
  localStorage.setItem("nutritionAppData", JSON.stringify(userData));
}

// Navigation
document
  .getElementById("nav-dashboard")
  .addEventListener("click", () => showSection("dashboard"));
document
  .getElementById("nav-weight")
  .addEventListener("click", () => showSection("weight-section"));
document
  .getElementById("nav-food")
  .addEventListener("click", () => showSection("food-section"));

function showSection(sectionId) {
  document.querySelectorAll("section").forEach((section) => {
    section.classList.remove("active-section");
  });
  document.querySelectorAll("nav button").forEach((button) => {
    button.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active-section");

  // Mettre à jour le bouton de navigation actif
  if (sectionId === "dashboard") {
    document.getElementById("nav-dashboard").classList.add("active");
    renderDashboard();
  } else if (sectionId === "weight-section") {
    document.getElementById("nav-weight").classList.add("active");
    renderWeightHistory();
  } else if (sectionId === "food-section") {
    document.getElementById("nav-food").classList.add("active");
    renderFoodLibrary();
  }
}

// Gestion des onglets aliments
document
  .getElementById("tab-add-food")
  .addEventListener("click", () => showFoodPanel("add-food-panel"));
document
  .getElementById("tab-food-library")
  .addEventListener("click", () => showFoodPanel("food-library-panel"));

function showFoodPanel(panelId) {
  document.querySelectorAll(".food-panel").forEach((panel) => {
    panel.classList.remove("active-panel");
  });
  document.querySelectorAll(".food-tabs button").forEach((button) => {
    button.classList.remove("active-tab");
  });

  document.getElementById(panelId).classList.add("active-panel");

  if (panelId === "add-food-panel") {
    document.getElementById("tab-add-food").classList.add("active-tab");
  } else {
    document.getElementById("tab-food-library").classList.add("active-tab");
  }
}

// Gestion du tableau de bord
function renderDashboard() {
  // Afficher le poids actuel
  const currentWeightElement = document.getElementById("current-weight");
  if (userData.weights.length > 0) {
    const sortedWeights = [...userData.weights].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    currentWeightElement.textContent = `${sortedWeights[0].weight} kg`;
  } else {
    currentWeightElement.textContent = "Pas de données";
  }

  // Calculer les calories d'aujourd'hui
  const today = new Date().toISOString().split("T")[0];
  const todayMeals = userData.meals.filter((meal) => meal.date === today);
  const todayCalories = todayMeals.reduce(
    (total, meal) => total + meal.calories,
    0
  );
  document.getElementById(
    "today-calories"
  ).textContent = `${todayCalories} kcal`;

  // Afficher les repas récents
  const recentMealsList = document.getElementById("recent-meals-list");
  recentMealsList.innerHTML = "";

  const recentMeals = [...userData.meals]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recentMeals.length === 0) {
    recentMealsList.innerHTML = "<li>Aucun repas enregistré</li>";
  } else {
    recentMeals.forEach((meal) => {
      const li = document.createElement("li");
      const mealDate = new Date(meal.date);
      li.textContent = `${mealDate.toLocaleDateString()} - ${meal.name} (${
        meal.calories
      } kcal)`;
      recentMealsList.appendChild(li);
    });
  }
}

// Gestion du suivi du poids
document
  .getElementById("save-weight")
  .addEventListener("click", saveWeightEntry);

function saveWeightEntry() {
  const weightInput = document.getElementById("weight-input");
  const dateInput = document.getElementById("weight-date");

  const weight = parseFloat(weightInput.value);
  const date = dateInput.value || new Date().toISOString().split("T")[0];

  if (!weight || isNaN(weight)) {
    alert("Veuillez entrer un poids valide.");
    return;
  }

  const newWeight = {
    id: Date.now(),
    weight,
    date,
  };

  userData.weights.push(newWeight);
  saveData();
  renderWeightHistory();
  renderDashboard();

  // Réinitialiser le formulaire
  weightInput.value = "";
  dateInput.value = "";
}

function renderWeightHistory() {
  const weightHistoryBody = document.getElementById("weight-history-body");
  weightHistoryBody.innerHTML = "";

  const sortedWeights = [...userData.weights].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (sortedWeights.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML =
      '<td colspan="3" style="text-align: center;">Aucune donnée de poids</td>';
    weightHistoryBody.appendChild(emptyRow);
  } else {
    sortedWeights.forEach((entry) => {
      const row = document.createElement("tr");
      const date = new Date(entry.date);

      row.innerHTML = `
                <td>${date.toLocaleDateString()}</td>
                <td>${entry.weight} kg</td>
                <td>
                    <button class="delete-btn" data-id="${
                      entry.id
                    }">Supprimer</button>
                </td>
            `;

      weightHistoryBody.appendChild(row);
    });

    // Ajouter des écouteurs d'événements pour les boutons de suppression
    document
      .querySelectorAll("#weight-history-body .delete-btn")
      .forEach((button) => {
        button.addEventListener("click", function () {
          deleteWeightEntry(this.getAttribute("data-id"));
        });
      });
  }
}

function deleteWeightEntry(id) {
  userData.weights = userData.weights.filter(
    (entry) => entry.id !== parseInt(id)
  );
  saveData();
  renderWeightHistory();
  renderDashboard();
}

// Gestion de la bibliothèque d'aliments
document.getElementById("add-food").addEventListener("click", addFoodToLibrary);

function addFoodToLibrary() {
  const nameInput = document.getElementById("food-name");
  const caloriesInput = document.getElementById("food-calories");
  const proteinInput = document.getElementById("food-protein");
  const carbsInput = document.getElementById("food-carbs");
  const fatInput = document.getElementById("food-fat");

  const name = nameInput.value.trim();
  const calories = parseFloat(caloriesInput.value);
  const protein = parseFloat(proteinInput.value) || 0;
  const carbs = parseFloat(carbsInput.value) || 0;
  const fat = parseFloat(fatInput.value) || 0;

  if (!name || !calories) {
    alert("Veuillez remplir au moins le nom et les calories.");
    return;
  }

  const newFood = {
    id: Date.now(),
    name,
    calories,
    protein,
    carbs,
    fat,
  };

  userData.foods.push(newFood);
  saveData();
  renderFoodLibrary();

  // Réinitialiser le formulaire
  nameInput.value = "";
  caloriesInput.value = "";
  proteinInput.value = "";
  carbsInput.value = "";
  fatInput.value = "";
}

function renderFoodLibrary() {
  const foodLibraryBody = document.getElementById("food-library-body");
  foodLibraryBody.innerHTML = "";

  userData.foods.forEach((food) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${food.name}</td>
            <td>${food.calories} kcal</td>
            <td>${food.protein}g / ${food.carbs}g / ${food.fat}g</td>
            <td>
                <button class="delete-btn" data-id="${food.id}">Supprimer</button>
            </td>
        `;

    foodLibraryBody.appendChild(row);
  });

  // Ajouter des écouteurs d'événements pour les boutons de suppression
  document
    .querySelectorAll("#food-library-body .delete-btn")
    .forEach((button) => {
      button.addEventListener("click", function () {
        deleteFoodFromLibrary(this.getAttribute("data-id"));
      });
    });
}

function deleteFoodFromLibrary(id) {
  userData.foods = userData.foods.filter((food) => food.id !== parseInt(id));
  saveData();
  renderFoodLibrary();
}

// Recherche d'aliments
const foodSearchInput = document.getElementById("food-search");
const searchResultsDiv = document.getElementById("search-results");

foodSearchInput.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase().trim();

  if (searchTerm.length < 2) {
    searchResultsDiv.style.display = "none";
    return;
  }

  const results = userData.foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm)
  );

  searchResultsDiv.innerHTML = "";

  if (results.length === 0) {
    searchResultsDiv.innerHTML = "<div>Aucun résultat trouvé</div>";
  } else {
    results.forEach((food) => {
      const div = document.createElement("div");
      div.textContent = `${food.name} (${food.calories} kcal)`;
      div.setAttribute("data-id", food.id);
      div.addEventListener("click", function () {
        addFoodToMeal(food.id);
      });
      searchResultsDiv.appendChild(div);
    });
  }

  searchResultsDiv.style.display = "block";
});

// Cacher les résultats lorsqu'on clique ailleurs
document.addEventListener("click", function (event) {
  if (
    !searchResultsDiv.contains(event.target) &&
    event.target !== foodSearchInput
  ) {
    searchResultsDiv.style.display = "none";
  }
});

// Gestion des repas
let currentMealFoods = [];

function addFoodToMeal(foodId) {
  const food = userData.foods.find((f) => f.id === parseInt(foodId));
  if (!food) return;

  // Ajouter la quantité par défaut
  const foodWithQuantity = {
    ...food,
    quantity: 100, // grammes par défaut
    totalCalories: food.calories,
  };

  currentMealFoods.push(foodWithQuantity);
  renderSelectedFoods();
  searchResultsDiv.style.display = "none";
  foodSearchInput.value = "";
}

function renderSelectedFoods() {
  const selectedFoodsList = document.getElementById("selected-foods-list");
  selectedFoodsList.innerHTML = "";

  if (currentMealFoods.length === 0) {
    selectedFoodsList.innerHTML = "<li>Aucun aliment sélectionné</li>";
  } else {
    currentMealFoods.forEach((food, index) => {
      const li = document.createElement("li");

      li.innerHTML = `
                <span>${food.name} - ${food.quantity}g (${food.totalCalories} kcal)</span>
                <span class="remove-food" data-index="${index}">✕</span>
            `;

      selectedFoodsList.appendChild(li);
    });

    // Ajouter des écouteurs d'événements pour les boutons de suppression
    document.querySelectorAll(".remove-food").forEach((button) => {
      button.addEventListener("click", function () {
        removeFromMeal(parseInt(this.getAttribute("data-index")));
      });
    });
  }

  // Mettre à jour le total des calories
  const totalCalories = currentMealFoods.reduce(
    (total, food) => total + food.totalCalories,
    0
  );
  document.getElementById("meal-total-calories").textContent = totalCalories;
}

function removeFromMeal(index) {
  currentMealFoods.splice(index, 1);
  renderSelectedFoods();
}

// Enregistrer un repas
document.getElementById("save-meal").addEventListener("click", saveMeal);

function saveMeal() {
  const nameInput = document.getElementById("meal-name");
  const dateInput = document.getElementById("meal-date");

  const name = nameInput.value.trim() || "Repas sans nom";
  const date = dateInput.value || new Date().toISOString().split("T")[0];

  if (currentMealFoods.length === 0) {
    alert("Veuillez ajouter au moins un aliment au repas.");
    return;
  }

  const totalCalories = currentMealFoods.reduce(
    (total, food) => total + food.totalCalories,
    0
  );

  const newMeal = {
    id: Date.now(),
    name,
    date,
    foods: [...currentMealFoods],
    calories: totalCalories,
  };

  userData.meals.push(newMeal);
  saveData();

  // Réinitialiser le formulaire
  nameInput.value = "";
  dateInput.value = "";
  currentMealFoods = [];
  renderSelectedFoods();
  renderDashboard();

  alert("Repas enregistré avec succès !");
}

// Initialiser l'application
document.addEventListener("DOMContentLoaded", () => {
  // Définir la date du jour
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("weight-date").value = today;
  document.getElementById("meal-date").value = today;

  // Charger les données
  loadData();

  // Afficher la section du tableau de bord par défaut
  showSection("dashboard");
});
