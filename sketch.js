let button = document.getElementById("searchBtn");
let input = document.getElementById("ingredientInput");
let container = document.getElementById("mealContainer");
let loading = document.getElementById("loading");
let sortSelect = document.getElementById("sortSelect");
let filterSelect = document.getElementById("filterSelect");
let favoriteContainer = document.getElementById("favoriteContainer");
let themeBtn = document.getElementById("themeBtn");

let mealsData = [];

function searchMeals() {
  let ingredient = input.value.trim();

  if (ingredient === "") {
    alert("Please enter an ingredient");
    return;
  }

  loading.style.display = "block";
  loading.innerHTML = "🍳 Searching for meals...";
  container.innerHTML = "";

  fetch("https://www.themealdb.com/api/json/v1/1/filter.php?i=" + ingredient)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      loading.style.display = "none";

      if (data.meals === null) {
        container.innerHTML =
          "<p class='empty-message'>😢 No meals found</p>";
        mealsData = [];
        return;
      }

      mealsData = data.meals;
      applyFiltersAndSort();
    })
    .catch(function () {
      loading.style.display = "none";
      container.innerHTML =
        "<p class='empty-message'>Something went wrong</p>";
    });
}

function showMeals(data) {
  container.innerHTML = "";

  for (let i = 0; i < data.length; i++) {
    let meal = data[i];

    fetch(
      "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + meal.idMeal
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (detailData) {
        let fullMeal = detailData.meals[0];

        let ingredients = [];

        for (let j = 1; j <= 20; j++) {
          let ingredient = fullMeal["strIngredient" + j];

          if (ingredient && ingredient.trim() !== "") {
            ingredients.push(ingredient);
          }
        }

        let card = document.createElement("div");
        card.className = "meal-card";

        card.innerHTML = `
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <h3>${meal.strMeal}</h3>

          <p class="ingredients">
            <strong>Ingredients:</strong><br>
            ${ingredients.slice(0, 6).join(", ")}
          </p>

          <button class="favorite-btn">❤️ Favorite</button>
          <button class="recipe-btn">View Recipe</button>
        `;

        let favoriteBtn = card.querySelector(".favorite-btn");
        let recipeBtn = card.querySelector(".recipe-btn");

        favoriteBtn.onclick = function () {
          saveFavorite(meal.strMeal, meal.strMealThumb);

        };

        recipeBtn.onclick = function () {
          alert(fullMeal.strInstructions);
        };

        container.appendChild(card);
      })
      .catch(function () {
        container.innerHTML =
          "<p class='empty-message'>Something went wrong</p>";
      });
  }
}

function applyFiltersAndSort() {
  let result = [];

  for (let i = 0; i < mealsData.length; i++) {
    let meal = mealsData[i];
    let name = meal.strMeal.toLowerCase();

    if (filterSelect.value === "veg") {
      if (
        name.includes("chicken") ||
        name.includes("beef") ||
        name.includes("fish") ||
        name.includes("pork")
      ) {
        continue;
      }
    }

    if (filterSelect.value === "nonveg") {
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

  if (sortSelect.value === "az") {
    result.sort(function (a, b) {
      return a.strMeal.localeCompare(b.strMeal);
    });
  }

  if (sortSelect.value === "za") {
    result.sort(function (a, b) {
      return b.strMeal.localeCompare(a.strMeal);
    });
  }

  showMeals(result);
}

function saveFavorite(name, image) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  for (let i = 0; i < favorites.length; i++) {
    if (favorites[i].name === name) {
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

  let updatedFavorites = [];

  for (let i = 0; i < favorites.length; i++) {
    if (favorites[i].name !== name) {
      updatedFavorites.push(favorites[i]);
    }
  }

  localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  showFavorites();
}

function showFavorites() {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  favoriteContainer.innerHTML = "";

  if (favorites.length === 0) {
    favoriteContainer.innerHTML = "<p>No favorite meals yet</p>";
    return;
  }

  for (let i = 0; i < favorites.length; i++) {
    let meal = favorites[i];

    favoriteContainer.innerHTML += `
      <div class="meal-card">
        <img src="${meal.image}" alt="${meal.name}">
        <h3>${meal.name}</h3>
        <button onclick="removeFavorite('${meal.name}')">Remove</button>
      </div>
    `;
  }
}

let clearBtn = document.getElementById("clearFavBtn");

if (clearBtn) {
  clearBtn.onclick = function () {
    localStorage.removeItem("favorites");
    showFavorites();
  };
}

button.onclick = function () {
  searchMeals();
};

input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    searchMeals();
  }
});

sortSelect.addEventListener("change", function () {
  applyFiltersAndSort();
});

filterSelect.addEventListener("change", function () {
  applyFiltersAndSort();
});

themeBtn.onclick = function () {
  document.body.classList.toggle("light-mode");

  if (document.body.classList.contains("light-mode")) {
    themeBtn.innerHTML = "☀️";
  } else {
    themeBtn.innerHTML = "🌙";
  }
};

showFavorites();