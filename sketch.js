let button = document.getElementById("searchBtn");
let input = document.getElementById("ingredientInput");
let container = document.getElementById("mealContainer");
let loading = document.getElementById("loading");

let sortSelect = document.getElementById("sortSelect");
let filterSelect = document.getElementById("filterSelect");
let favoriteContainer = document.getElementById("favoriteContainer");

let mealsData = [];

function showMeals(data) {
  container.innerHTML = "";

  for (let i = 0; i < data.length; i++) {
    let meal = data[i];

    fetch("https://themealdb.com/api/json/v1/1/lookup.php?i=" + meal.idMeal)
      .then(function (response) {
        return response.json();
      })
      .then(function (detailData) {
        let fullMeal = detailData.meals[0];

        let ingredients = [];

        for (let j = 1; j <= 20; j++) {
          let item = fullMeal["strIngredient" + j];

          if (item != "" && item != null) {
            ingredients.push(item);
          }
        }

        let card = document.createElement("div");
        card.className = "meal-card";

        card.innerHTML = `
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <h3>${meal.strMeal}</h3>

          <p>
            <b>Ingredients:</b><br>
            ${ingredients.join(", ")}
          </p>

          <button class="favorite-btn">❤️ Favorite</button>
          <button class="view-btn">View Recipe</button>
        `;

        card.querySelector(".favorite-btn").onclick = function () {
          saveFavorite(meal.strMeal, meal.strMealThumb);
        };

        card.querySelector(".view-btn").onclick = function () {
          alert(fullMeal.strInstructions);
        };

        container.appendChild(card);
      });
  }
}

function searchMeals() {
  let ingredient = input.value.trim();

  if (ingredient == "") {
    alert("Please enter an ingredient");
    return;
  }

  loading.style.display = "block";
  loading.innerHTML = "🍳 Searching for meals...";
  container.innerHTML = "";

  fetch("https://themealdb.com/api/json/v1/1/filter.php?i=" + ingredient)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      loading.style.display = "none";

      if (data.meals == null) {
        container.innerHTML = `
          <p class="empty-message">
            😢 No meals found for "${ingredient}"
          </p>
        `;
        mealsData = [];
        return;
      }

      mealsData = data.meals;
      applyFiltersAndSort();
    })
    .catch(function () {
      loading.style.display = "none";
      container.innerHTML = `
        <p class="empty-message">Something went wrong</p>
      `;
    });
}

button.onclick = searchMeals;

input.addEventListener("keypress", function (event) {
  if (event.key == "Enter") {
    searchMeals();
  }
});

function applyFiltersAndSort() {
  let result = [];

  for (let i = 0; i < mealsData.length; i++) {
    let meal = mealsData[i];
    let name = meal.strMeal.toLowerCase();

    if (filterSelect.value == "veg") {
      if (
        name.includes("chicken") ||
        name.includes("beef") ||
        name.includes("fish") ||
        name.includes("pork")
      ) {
        continue;
      }
    }

    if (filterSelect.value == "nonveg") {
      if (
        !name.includes("chicken") &&
        !name.includes("beef") &&
        !name.includes("fish") &&
        !name.includes("pork")
      ) {
        continue;
      }
    }

    result.push(meal);
  }

  if (sortSelect.value == "az") {
    result.sort(function (a, b) {
      return a.strMeal.localeCompare(b.strMeal);
    });
  }

  if (sortSelect.value == "za") {
    result.sort(function (a, b) {
      return b.strMeal.localeCompare(a.strMeal);
    });
  }

  showMeals(result);
}

sortSelect.addEventListener("change", applyFiltersAndSort);
filterSelect.addEventListener("change", applyFiltersAndSort);

function saveFavorite(name, image) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  for (let i = 0; i < favorites.length; i++) {
    if (favorites[i].name == name) {
      alert("Already added to favorites");
      return;
    }
  }

  favorites.push({
    name: name,
    image: image
  });

  localStorage.setItem("favorites", JSON.stringify(favorites));

  showFavorites();
}

function removeFavorite(name) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  let newFavorites = [];

  for (let i = 0; i < favorites.length; i++) {
    if (favorites[i].name != name) {
      newFavorites.push(favorites[i]);
    }
  }

  localStorage.setItem("favorites", JSON.stringify(newFavorites));

  showFavorites();
}

function showFavorites() {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  favoriteContainer.innerHTML = "";

  if (favorites.length == 0) {
    favoriteContainer.innerHTML = `
      <p class="empty-message">No favorite meals yet</p>
    `;
    return;
  }

  favoriteContainer.innerHTML = `
    <button id="clearFavBtn">Clear All Favorites</button>
  `;

  for (let i = 0; i < favorites.length; i++) {
    let meal = favorites[i];

    favoriteContainer.innerHTML += `
      <div class="meal-card">
        <img src="${meal.image}">
        <h3>${meal.name}</h3>

        <button class="remove-btn" onclick="removeFavorite('${meal.name}')">
          Remove
        </button>
      </div>
    `;
  }

  document.getElementById("clearFavBtn").onclick = function () {
    localStorage.removeItem("favorites");
    showFavorites();
  };
}

showFavorites();

let themeBtn = document.getElementById("themeBtn");

themeBtn.onclick = function () {
  document.body.classList.toggle("light-mode");

  if (document.body.classList.contains("light-mode")) {
    themeBtn.innerHTML = "☀️";
  } else {
    themeBtn.innerHTML = "🌙";
  }
};