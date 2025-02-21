const SERVER_URL = "http://localhost:8080";

const currentDiv = document.getElementById("current");
const historyDiv = document.getElementById("history");
const refreshButton = document.getElementById("refreshButton");

// load history from local storage
let historyData = JSON.parse(localStorage.getItem("historyData")) || [];

// render current top3 reviews
const renderCurrent = (data) => {
  currentDiv.innerHTML = "";
  data.top3Reviews.forEach(review => {
    const reviewEl = document.createElement("div");
    reviewEl.classList.add("review");
    reviewEl.innerHTML = `<strong>${review.name}</strong><br>
      ${review.body}<br>
      Rating: ${review.rating}<br>
      Date: ${new Date(review.date).toLocaleString()} (${review.timezone})`;
    currentDiv.appendChild(reviewEl);
  });
};

// render history list
const renderHistory = () => {
  historyDiv.innerHTML = "";
  historyData.forEach(review => {
    const reviewEl = document.createElement("div");
    reviewEl.classList.add("review");
    if (review.rating <= 1) reviewEl.classList.add("rating-red");
    else if (review.rating <= 3) reviewEl.classList.add("rating-yellow");
    else reviewEl.classList.add("rating-green");
    
    reviewEl.innerHTML = `<strong>${review.name}</strong><br>
      ${review.body}<br>
      Rating: ${review.rating}<br>
      Date: ${new Date(review.date).toLocaleString()} (${review.timezone})`;
    historyDiv.appendChild(reviewEl);
  });
};

// save history to local storage
const persistHistory = () => {
  localStorage.setItem("historyData", JSON.stringify(historyData));
};

// getTop3 function to take top3 reviews from server
const getTop3 = () => {
  refreshButton.disabled = true;
  const timestamp = Date.now();
  fetch(`${SERVER_URL}/task/${timestamp}`)
    .then(response => response.json())
    .then(data => {
      renderCurrent(data);
      
      // add new reviews to history
      data.top3Reviews.forEach(review => {
        historyData.push(review);
      });
      persistHistory();
      renderHistory();
    })
    .catch(err => console.error("error taking top3:", err))
    .finally(() => {
      refreshButton.disabled = false;
    });
};

// refresh function
const refresh = () => {
  getTop3();
};

refreshButton.addEventListener("click", refresh);

window.addEventListener("load", () => {
  getTop3();
  setInterval(getTop3, 30000);
  renderHistory();
});
