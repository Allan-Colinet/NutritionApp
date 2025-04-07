// Variables globales pour le stockage des données
const USER_DATA_KEY = "nutritionTrackerUserData";
const WEIGHT_DATA_KEY = "nutritionTrackerWeightData";
const FOOD_DATA_KEY = "nutritionTrackerFoodData";
const ACTIVITY_DATA_KEY = "nutritionTrackerActivityData";
const FOOD_LIBRARY_KEY = "nutritionTrackerFoodLibrary";

// Données utilisateur par défaut
const defaultUserData = {
  gender: "male",
  age: 30,
  height: 175,
  activityLevel: "1.55",
  goalWeight: 70,
  goalDate: getDateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 jours à partir d'aujourd'hui
  currentWeight: 75,
};

// Base de données d'aliments par défaut
const defaultFoodLibrary = [
  {
    name: "Pomme",
    calories: 52,
    proteins: 0.3,
    carbs: 14,
    fats: 0.2,
    portion: "1 moyenne (100g)",
  },
  {
    name: "Banane",
    calories: 89,
    proteins: 1.1,
    carbs: 23,
    fats: 0.3,
    portion: "1 moyenne (120g)",
  },
  {
    name: "Poulet grillé",
    calories: 165,
    proteins: 31,
    carbs: 0,
    fats: 3.6,
    portion: "100g",
  },
  {
    name: "Riz blanc cuit",
    calories: 130,
    proteins: 2.7,
    carbs: 28,
    fats: 0.3,
    portion: "100g",
  },
  {
    name: "Œuf",
    calories: 78,
    proteins: 6.3,
    carbs: 0.6,
    fats: 5.3,
    portion: "1 moyen (50g)",
  },
  {
    name: "Pain complet",
    calories: 247,
    proteins: 13,
    carbs: 41,
    fats: 3.6,
    portion: "100g",
  },
  {
    name: "Yaourt nature",
    calories: 59,
    proteins: 3.6,
    carbs: 4.7,
    fats: 3.1,
    portion: "100g",
  },
  {
    name: "Saumon",
    calories: 208,
    proteins: 20,
    carbs: 0,
    fats: 13,
    portion: "100g",
  },
  {
    name: "Avocat",
    calories: 160,
    proteins: 2,
    carbs: 9,
    fats: 15,
    portion: "1/2 moyen (100g)",
  },
  {
    name: "Lait demi-écrémé",
    calories: 42,
    proteins: 3.5,
    carbs: 5,
    fats: 1.5,
    portion: "100ml",
  },
];

// Base de données d'activités par défaut
const defaultActivityLibrary = [
  { name: "Marche", caloriesPerMinute: 4, intensity: "légère" },
  { name: "Course à pied", caloriesPerMinute: 10, intensity: "intense" },
  { name: "Vélo", caloriesPerMinute: 7, intensity: "modérée" },
  { name: "Natation", caloriesPerMinute: 8, intensity: "modérée" },
  { name: "Yoga", caloriesPerMinute: 3, intensity: "légère" },
  { name: "Musculation", caloriesPerMinute: 6, intensity: "modérée" },
  { name: "Danse", caloriesPerMinute: 5, intensity: "modérée" },
  { name: "Football", caloriesPerMinute: 8, intensity: "intense" },
  { name: "Jardinage", caloriesPerMinute: 4, intensity: "légère" },
  { name: "Ménage", caloriesPerMinute: 3, intensity: "légère" },
];

// Chargement des données au démarrage
let userData = loadFromLocalStorage(USER_DATA_KEY) || defaultUserData;
let weightData = loadFromLocalStorage(WEIGHT_DATA_KEY) || [];
let foodData = loadFromLocalStorage(FOOD_DATA_KEY) || [];
let activityData = loadFromLocalStorage(ACTIVITY_DATA_KEY) || [];
let foodLibrary = loadFromLocalStorage(FOOD_LIBRARY_KEY) || defaultFoodLibrary;

// Fonctions utilitaires
function loadFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getDateString(date) {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

function formatDate(dateString) {
  const options = { day: "numeric", month: "long", year: "numeric" };
  return new Date(dateString).toLocaleDateString("fr-FR", options);
}

// Initialisation de l'application
document.addEventListener("DOMContentLoaded", function () {
  initNavigation();
  loadUserProfile();
  updateDashboard();
  initWeightSection();
  initFoodSection();
  initActivitySection();
  setupEventListeners();
});

// Configuration de la navigation
function initNavigation() {
  const navButtons = document.querySelectorAll("nav button");
  const sections = document.querySelectorAll("main section");

  navButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetId =
        this.id.split("-")[1] + (this.id === "nav-dashboard" ? "" : "-section");

      // Désactiver tous les boutons et sections
      navButtons.forEach((btn) => btn.classList.remove("active"));
      sections.forEach((section) => section.classList.remove("active-section"));

      // Activer le bouton et la section cibles
      this.classList.add("active");
      document.getElementById(targetId).classList.add("active-section");
    });
  });
}

// Chargement et mise à jour du profil utilisateur
function loadUserProfile() {
  // Remplir le formulaire avec les données utilisateur existantes
  document.getElementById("user-gender").value = userData.gender;
  document.getElementById("user-age").value = userData.age;
  document.getElementById("user-height").value = userData.height;
  document.getElementById("user-activity-level").value = userData.activityLevel;
  document.getElementById("goal-weight").value = userData.goalWeight;
  document.getElementById("goal-date").value = userData.goalDate;

  // Calculer et afficher les besoins caloriques
  updateCalorieNeeds();

  // Générer les dates suggérées
  generateSuggestedDates();
}

// Calcul des besoins caloriques
function updateCalorieNeeds() {
  const gender = userData.gender;
  const age = parseFloat(userData.age);
  const height = parseFloat(userData.height);
  const weight = parseFloat(userData.currentWeight);
  const activityLevel = parseFloat(userData.activityLevel);

  // Calcul du BMR (métabolisme de base) selon la formule de Mifflin-St Jeor
  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Calcul des besoins de maintien
  const maintenance = Math.round(bmr * activityLevel);

  // Calcul de l'objectif (déficit de 500 kcal pour perdre environ 0.5kg/semaine)
  const target = Math.max(1200, maintenance - 500); // Minimum sécuritaire de 1200kcal

  // Mise à jour de l'affichage
  document.getElementById("bmr-value").textContent = Math.round(bmr) + " kcal";
  document.getElementById("maintenance-value").textContent =
    maintenance + " kcal";
  document.getElementById("target-value").textContent = target + " kcal";
  document.getElementById("daily-goal").textContent = target + " kcal";
}

// Génération de dates suggérées pour l'objectif de poids
function generateSuggestedDates() {
  const currentWeight = parseFloat(userData.currentWeight);
  const goalWeight = parseFloat(userData.goalWeight);
  const weightDiff = Math.abs(currentWeight - goalWeight);

  // Différentes vitesses de progression (perte/gain en kg par semaine)
  const rates = [0.25, 0.5, 1];
  const suggestedDates = rates.map((rate) => {
    const weeks = weightDiff / rate;
    const date = new Date();
    date.setDate(date.getDate() + Math.ceil(weeks * 7));
    return {
      rate: rate,
      date: date,
    };
  });

  // Affichage des dates suggérées
  const container = document.getElementById("suggested-dates-list");
  container.innerHTML = "";

  suggestedDates.forEach((item) => {
    const div = document.createElement("div");
    div.className = "suggested-date";
    div.textContent = `${item.rate} kg/semaine: ${formatDate(item.date)}`;
    div.addEventListener("click", function () {
      document.getElementById("goal-date").value = getDateString(item.date);
    });
    container.appendChild(div);
  });
}

// Mise à jour du tableau de bord
function updateDashboard() {
  // Mise à jour du poids actuel
  document.getElementById("current-weight").textContent =
    userData.currentWeight + " kg";

  // Aujourd'hui en format YYYY-MM-DD
  const today = getDateString(new Date());

  // Calcul des calories consommées aujourd'hui
  const caloriesConsumed = foodData
    .filter((item) => item.date === today)
    .reduce((sum, item) => sum + item.calories, 0);
  document.getElementById("today-calories").textContent =
    caloriesConsumed + " kcal";

  // Calcul des calories brûlées aujourd'hui
  const caloriesBurned = activityData
    .filter((item) => item.date === today)
    .reduce((sum, item) => sum + item.calories, 0);
  document.getElementById("today-burned").textContent =
    caloriesBurned + " kcal";

  // Mise à jour du graphique des macronutriments
  updateMacrosChart();

  // Mise à jour des listes récentes
  updateRecentMeals();
  updateRecentActivities();
}

// Mise à jour du graphique des macronutriments
function updateMacrosChart() {
  const today = getDateString(new Date());
  const todayFoods = foodData.filter((item) => item.date === today);

  // Calcul des macronutriments totaux
  const macros = todayFoods.reduce(
    (acc, item) => {
      acc.proteins += item.proteins || 0;
      acc.carbs += item.carbs || 0;
      acc.fats += item.fats || 0;
      return acc;
    },
    { proteins: 0, carbs: 0, fats: 0 }
  );

  // Configuration du graphique
  const ctx = document.getElementById("macros-chart").getContext("2d");

  // Vérifier si un graphique existe déjà
  if (window.macrosChart instanceof Chart) {
    window.macrosChart.destroy();
  }

  window.macrosChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Protéines", "Glucides", "Lipides"],
      datasets: [
        {
          data: [macros.proteins, macros.carbs, macros.fats],
          backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Mise à jour de la liste des repas récents
function updateRecentMeals() {
  const list = document.getElementById("recent-meals-list");
  list.innerHTML = "";

  // Trier par date (plus récent en premier) et limiter à 5 éléments
  const recentMeals = [...foodData]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recentMeals.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Aucun repas enregistré";
    list.appendChild(li);
    return;
  }

  recentMeals.forEach((meal) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <span class="meal-name">${meal.name}</span>
            <span class="meal-details">
                <span class="meal-date">${formatDate(meal.date)}</span>
                <span class="meal-calories">${meal.calories} kcal</span>
            </span>
        `;
    list.appendChild(li);
  });
}

// Mise à jour de la liste des activités récentes
function updateRecentActivities() {
  const list = document.getElementById("recent-activities-list");
  list.innerHTML = "";

  // Trier par date (plus récent en premier) et limiter à 5 éléments
  const recentActivities = [...activityData]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recentActivities.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Aucune activité enregistrée";
    list.appendChild(li);
    return;
  }

  recentActivities.forEach((activity) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <span class="activity-name">${activity.name}</span>
            <span class="activity-details">
                <span class="activity-date">${formatDate(activity.date)}</span>
                <span class="activity-duration">${activity.duration} min</span>
                <span class="activity-calories">${activity.calories} kcal</span>
            </span>
        `;
    list.appendChild(li);
  });
}

// Initialisation de la section de suivi de poids
function initWeightSection() {
  // Définir la date du jour pour le formulaire de poids
  document.getElementById("weight-date").value = getDateString(new Date());

  // Mettre à jour le tableau d'historique de poids
  updateWeightTable();

  // Mettre à jour le graphique de poids
  updateWeightChart();
}

// Mise à jour du tableau d'historique de poids
function updateWeightTable() {
  const tableBody = document.getElementById("weight-history-body");
  tableBody.innerHTML = "";

  // Trier par date (plus récent en premier)
  const sortedWeightData = [...weightData].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (sortedWeightData.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="3">Aucun poids enregistré</td>';
    tableBody.appendChild(row);
    return;
  }

  sortedWeightData.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${formatDate(entry.date)}</td>
            <td>${entry.weight} kg</td>
            <td>
                <button class="btn-delete" data-index="${index}">Supprimer</button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  // Ajouter des écouteurs d'événements pour les boutons de suppression
  document.querySelectorAll(".btn-delete").forEach((button) => {
    button.addEventListener("click", function () {
      const dateToDelete = sortedWeightData[this.dataset.index].date;
      weightData = weightData.filter((entry) => entry.date !== dateToDelete);
      saveToLocalStorage(WEIGHT_DATA_KEY, weightData);
      updateWeightTable();
      updateWeightChart();

      // Mettre à jour le poids actuel si nécessaire
      if (weightData.length > 0) {
        const latestWeight = weightData.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )[0].weight;
        userData.currentWeight = latestWeight;
        saveToLocalStorage(USER_DATA_KEY, userData);
        updateDashboard();
        updateCalorieNeeds();
      }
    });
  });
}

// Mise à jour du graphique de poids
function updateWeightChart() {
  // Trier par date (plus ancien en premier)
  const sortedWeightData = [...weightData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const labels = sortedWeightData.map((entry) => formatDate(entry.date));
  const weights = sortedWeightData.map((entry) => entry.weight);

  // Configuration du graphique
  const ctx = document.getElementById("weight-chart").getContext("2d");

  // Vérifier si un graphique existe déjà
  if (window.weightChart instanceof Chart) {
    window.weightChart.destroy();
  }

  window.weightChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Poids (kg)",
          data: weights,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

// Initialisation de la section de suivi alimentaire
function initFoodSection() {
  // Initialiser la date du jour pour le formulaire d'ajout d'aliment
  const foodDateInputs = document.querySelectorAll(".food-date-input");
  foodDateInputs.forEach((input) => {
    input.value = getDateString(new Date());
  });

  // Charger la bibliothèque d'aliments
  updateFoodLibrary();

  // Configurer la recherche d'aliments
  setupFoodSearch();
}

// Mise à jour de la bibliothèque d'aliments
function updateFoodLibrary() {
  const libraryContainer = document.getElementById("food-library-list");
  if (!libraryContainer) return;

  libraryContainer.innerHTML = "";

  foodLibrary.forEach((food, index) => {
    const foodItem = document.createElement("div");
    foodItem.className = "food-item";
    foodItem.innerHTML = `
            <div class="food-item-details">
                <h4>${food.name}</h4>
                <p>${food.calories} kcal | P: ${food.proteins}g | G: ${food.carbs}g | L: ${food.fats}g</p>
                <p>Portion: ${food.portion}</p>
            </div>
            <div class="food-item-actions">
                <button class="btn-add-food" data-index="${index}">Ajouter</button>
            </div>
        `;
    libraryContainer.appendChild(foodItem);
  });

  // Ajouter des écouteurs pour les boutons d'ajout
  document.querySelectorAll(".btn-add-food").forEach((button) => {
    button.addEventListener("click", function () {
      const foodIndex = parseInt(this.dataset.index);
      const selectedFood = foodLibrary[foodIndex];

      // Remplir le formulaire d'ajout de repas
      document.getElementById("food-name").value = selectedFood.name;
      document.getElementById("food-calories").value = selectedFood.calories;
      document.getElementById("food-proteins").value = selectedFood.proteins;
      document.getElementById("food-carbs").value = selectedFood.carbs;
      document.getElementById("food-fats").value = selectedFood.fats;

      // Activer l'onglet d'ajout de repas
      document.getElementById("tab-add-food").click();
    });
  });
}

// Configuration de la recherche d'aliments
function setupFoodSearch() {
  const searchInput = document.getElementById("food-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const foodItems = document.querySelectorAll(".food-item");

    foodItems.forEach((item) => {
      const foodName = item.querySelector("h4").textContent.toLowerCase();
      if (foodName.includes(query)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });
}

// Initialisation de la section d'activité
function initActivitySection() {
  // Initialiser la date du jour pour le formulaire d'ajout d'activité
  const activityDateInput = document.getElementById("activity-date");
  if (activityDateInput) {
    activityDateInput.value = getDateString(new Date());
  }

  // Remplir la liste des activités
  const activitySelect = document.getElementById("activity-type");
  if (activitySelect) {
    activitySelect.innerHTML =
      '<option value="">Sélectionnez une activité</option>';
    defaultActivityLibrary.forEach((activity) => {
      const option = document.createElement("option");
      option.value = activity.name;
      option.textContent = `${activity.name} (${activity.intensity})`;
      option.dataset.calories = activity.caloriesPerMinute;
      activitySelect.appendChild(option);
    });

    // Ajouter un écouteur d'événements pour calculer les calories brûlées
    activitySelect.addEventListener("change", calculateActivityCalories);
    document
      .getElementById("activity-duration")
      .addEventListener("input", calculateActivityCalories);
  }

  // Mettre à jour l'historique des activités
  updateActivityHistory();
}

// Calcul des calories brûlées pour une activité
function calculateActivityCalories() {
  const activitySelect = document.getElementById("activity-type");
  const durationInput = document.getElementById("activity-duration");
  const caloriesOutput = document.getElementById("activity-calories");

  if (!activitySelect || !durationInput || !caloriesOutput) return;

  const selectedOption = activitySelect.options[activitySelect.selectedIndex];
  const duration = parseFloat(durationInput.value) || 0;

  if (selectedOption && selectedOption.dataset.calories) {
    const caloriesPerMinute = parseFloat(selectedOption.dataset.calories);
    const totalCalories = Math.round(caloriesPerMinute * duration);
    caloriesOutput.value = totalCalories;
  } else {
    caloriesOutput.value = "";
  }
}

// Mise à jour de l'historique des activités
function updateActivityHistory() {
  const historyContainer = document.getElementById("activity-history");
  if (!historyContainer) return;

  historyContainer.innerHTML = "";

  if (activityData.length === 0) {
    historyContainer.innerHTML = "<p>Aucune activité enregistrée</p>";
    return;
  }

  // Trier par date (plus récent en premier)
  const sortedActivities = [...activityData].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  sortedActivities.forEach((activity, index) => {
    const activityItem = document.createElement("div");
    activityItem.className = "activity-item";
    activityItem.innerHTML = `
            <div class="activity-item-details">
                <h4>${activity.name}</h4>
                <p>Date: ${formatDate(activity.date)}</p>
                <p>Durée: ${activity.duration} minutes</p>
                <p>Calories brûlées: ${activity.calories} kcal</p>
            </div>
            <div class="activity-item-actions">
                <button class="btn-delete-activity" data-index="${index}">Supprimer</button>
            </div>
        `;
    historyContainer.appendChild(activityItem);
  });

  // Ajouter des écouteurs pour les boutons de suppression
  document.querySelectorAll(".btn-delete-activity").forEach((button) => {
    button.addEventListener("click", function () {
      const activityIndex = parseInt(this.dataset.index);
      activityData.splice(activityIndex, 1);
      saveToLocalStorage(ACTIVITY_DATA_KEY, activityData);
      updateActivityHistory();
      updateDashboard();
    });
  });
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
  // Enregistrer le profil
  document
    .getElementById("save-profile")
    .addEventListener("click", function () {
      userData = {
        gender: document.getElementById("user-gender").value,
        age: parseFloat(document.getElementById("user-age").value),
        height: parseFloat(document.getElementById("user-height").value),
        activityLevel: document.getElementById("user-activity-level").value,
        goalWeight: parseFloat(document.getElementById("goal-weight").value),
        goalDate: document.getElementById("goal-date").value,
        currentWeight: userData.currentWeight, // Conserver le poids actuel
      };

      saveToLocalStorage(USER_DATA_KEY, userData);
      updateCalorieNeeds();
      updateDashboard();
      alert("Profil enregistré avec succès !");
    });

  // Enregistrer une entrée de poids
  document.getElementById("save-weight").addEventListener("click", function () {
    const weight = parseFloat(document.getElementById("weight-input").value);
    const date = document.getElementById("weight-date").value;

    if (!weight || !date) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    // Vérifier si une entrée existe déjà pour cette date
    const existingEntryIndex = weightData.findIndex(
      (entry) => entry.date === date
    );

    if (existingEntryIndex !== -1) {
      // Mettre à jour l'entrée existante
      weightData[existingEntryIndex].weight = weight;
    } else {
      // Ajouter une nouvelle entrée
      weightData.push({ date, weight });
    }

    // Mettre à jour le poids actuel
    userData.currentWeight = weight;

    // Sauvegarder les données
    saveToLocalStorage(WEIGHT_DATA_KEY, weightData);
    saveToLocalStorage(USER_DATA_KEY, userData);

    // Mettre à jour l'interface
    updateWeightTable();
    updateWeightChart();
    updateDashboard();
    updateCalorieNeeds();

    // Réinitialiser le formulaire
    document.getElementById("weight-input").value = "";
    document.getElementById("weight-date").value = getDateString(new Date());

    alert("Poids enregistré avec succès !");
  });

  // Enregistrer un aliment/repas
  const saveFood = document.getElementById("save-food");
  if (saveFood) {
    saveFood.addEventListener("click", function () {
      const name = document.getElementById("food-name").value;
      const calories = parseFloat(
        document.getElementById("food-calories").value
      );
      const proteins = parseFloat(
        document.getElementById("food-proteins").value
      );
      const carbs = parseFloat(document.getElementById("food-carbs").value);
      const fats = parseFloat(document.getElementById("food-fats").value);
      const date = document.getElementById("food-date").value;

      if (!name || isNaN(calories) || !date) {
        alert("Veuillez remplir au moins le nom, les calories et la date.");
        return;
      }

      // Ajouter à la liste des aliments consommés
      const newFood = {
        name,
        calories,
        proteins: isNaN(proteins) ? 0 : proteins,
        carbs: isNaN(carbs) ? 0 : carbs,
        fats: isNaN(fats) ? 0 : fats,
        date,
      };

      foodData.push(newFood);
      saveToLocalStorage(FOOD_DATA_KEY, foodData);

      // Mettre à jour le tableau de bord
      updateDashboard();

      // Réinitialiser le formulaire
      document.getElementById("food-name").value = "";
      document.getElementById("food-calories").value = "";
      document.getElementById("food-proteins").value = "";
      document.getElementById("food-carbs").value = "";
      document.getElementById("food-fats").value = "";
      document.getElementById("food-date").value = getDateString(new Date());

      alert("Aliment enregistré avec succès !");
    });
  }

  // Enregistrer une activité
  const saveActivity = document.getElementById("save-activity");
  if (saveActivity) {
    saveActivity.addEventListener("click", function () {
      const activitySelect = document.getElementById("activity-type");
      const name = activitySelect.options[activitySelect.selectedIndex].value;
      const duration = parseFloat(
        document.getElementById("activity-duration").value
      );
      const calories = parseFloat(
        document.getElementById("activity-calories").value
      );
      const date = document.getElementById("activity-date").value;

      if (!name || isNaN(duration) || isNaN(calories) || !date) {
        alert("Veuillez remplir tous les champs.");
        return;
      }

      // Ajouter à la liste des activités
      const newActivity = {
        name,
        duration,
        calories,
        date,
      };

      activityData.push(newActivity);
      saveToLocalStorage(ACTIVITY_DATA_KEY, activityData);

      // Mettre à jour l'interface
      updateActivityHistory();
      updateDashboard();

      // Réinitialiser le formulaire
      activitySelect.selectedIndex = 0;
      document.getElementById("activity-duration").value = "";
      document.getElementById("activity-calories").value = "";
      document.getElementById("activity-date").value = getDateString(
        new Date()
      );
    });
  }

  // Gestion des onglets de la section alimentaire
  const foodTabs = document.querySelectorAll(".food-tabs button");
  const foodPanels = document.querySelectorAll(".food-panel");

  foodTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const targetPanel = this.id.replace("tab-", "") + "-panel";

      // Désactiver tous les onglets et panels
      foodTabs.forEach((t) => t.classList.remove("active-tab"));
      foodPanels.forEach((p) => p.classList.remove("active-panel"));

      // Activer l'onglet et le panel sélectionnés
      this.classList.add("active-tab");
      document.getElementById(targetPanel).classList.add("active-panel");
    });
  });
}

// Initialisation du scanner d'aliments (fonctionnalité simulée)
function initFoodScanner() {
  const scanButton = document.getElementById("scan-food-button");
  if (scanButton) {
    scanButton.addEventListener("click", function () {
      // Simulation de scan - à remplacer par une vraie implémentation
      alert("Fonctionnalité de scan non implémentée. Ajout manuel requis.");
    });
  }
}

// Sauvegarde des données avant fermeture de la page
window.addEventListener("beforeunload", function () {
  saveToLocalStorage(USER_DATA_KEY, userData);
  saveToLocalStorage(WEIGHT_DATA_KEY, weightData);
  saveToLocalStorage(FOOD_DATA_KEY, foodData);
  saveToLocalStorage(ACTIVITY_DATA_KEY, activityData);
  saveToLocalStorage(FOOD_LIBRARY_KEY, foodLibrary);
});
