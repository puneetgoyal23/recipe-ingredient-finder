let button = document.getElementById("searchBtn");
let input = document.getElementById("ingredientInput");
let container = document.getElementById("mealContainer");
let loading = document.getElementById("loading");

function searchMeals() {
  let ingredient = input.value;

  loading.style.display = "block";
  container.innerHTML = "";

  fetch("https://themealdb.com/api/json/v1/1/filter.php?i=" + ingredient)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      loading.style.display = "none";

      if (data.meals == null) {
        container.innerHTML = "<p>No meals found</p>";
      } else {
        data.meals.forEach(function (meal) {
          fetch("https://themealdb.com/api/json/v1/1/lookup.php?i=" + meal.idMeal)
            .then(function (response) {
              return response.json();
            })
            .then(function (detailData) {
              let fullMeal = detailData.meals[0];

              let ingredients = [];

              for (let i = 1; i <= 5; i++) {
                let item = fullMeal["strIngredient" + i];

                if (item && item !== "") {
                  ingredients.push(item);
                }
              }

              container.innerHTML += `
                <div class="meal-card">
                  <img src="${meal.strMealThumb}">
                  <h3>${meal.strMeal}</h3>
                  <p><b>Ingredients:</b> ${ingredients.join(", ")}</p>
                </div>
              `;
            });
        });
      }
    });
}

button.onclick = searchMeals;

input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    searchMeals();
  }
});