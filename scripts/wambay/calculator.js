/**
 * Wambay — Calculator Script
 * Prijscalculator voor Webflow projecten
 */
const buttonsToGoBack = document.querySelectorAll("[data-go-back]");
buttonsToGoBack.forEach((x) => {
  x.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "https://wambay.com";
    }
  });
});

//find inputfield
let numberOfPages = 1;
let totalPrice = 0;
let totalWork = 0;
let componentPrice = 0;
let interactionsPrice = 0;
const pricePerCollection = 150;
const pricePerIntegration = 300;

const numField = document.querySelector("#Numer-of-pages");
const plus = document.querySelector("#btnAdd");
const minus = document.querySelector("#btnSubtract");
const totalPriceField = document.querySelector("#totalPrice");
const totalWorkField = document.querySelector("#totalWork");
const componentPriceOnBtn = document.querySelector("#componentPriceOn");
const componentPriceOffBtn = document.querySelector("#componentPriceOff");
const interactionsPriceBasic = document.querySelector(
  "#interactions---basic"
);
const interactionsPriceCommon = document.querySelector(
  "#interactions---common"
);
const interactionsPriceRare = document.querySelector("#interactions---rare");
const myCMSCollections = document.querySelectorAll(
  ".is-cms-collections input"
);
const integrationsList = document.querySelectorAll(".is-integrations input");

function calculateTotalPrice() {
  //find out how many CMS collections
  const numberOfCMSCollections = document.querySelectorAll(
    ".is-cms-collections .w--redirected-checked"
  ).length;
  const numberOfIntegrations = document.querySelectorAll(
    ".is-integrations .w--redirected-checked"
  ).length;

  // Calculate the price per page based on the number of pages
  let totalPagePrice = 0;
  if (numberOfPages <= 7) {
    totalPagePrice = 350 * Math.max(2, numberOfPages);
  } else if (numberOfPages <= 11) {
    totalPagePrice = 350 * 7 + 300 * (numberOfPages - 7);
  } else {
    totalPagePrice = 350 * 7 + 300 * 4 + 250 * (numberOfPages - 11);
  }

  totalPagePrice =
    totalPagePrice +
    componentPrice * numberOfPages +
    interactionsPrice * numberOfPages;

  let totalWork = 0;
  if (numberOfPages <= 7) {
    totalWork = 3 * Math.max(3, numberOfPages);
  } else if (numberOfPages <= 11) {
    totalWork = 3 * 7 + 2 * (numberOfPages - 7);
  } else {
    totalWork = 3 * 7 + 2 * 4 + 1 * (numberOfPages - 11);
  }

  totalPrice =
    totalPagePrice +
    numberOfCMSCollections * pricePerCollection +
    numberOfIntegrations * pricePerIntegration;
  totalPriceField.innerHTML = totalPrice;
  totalWorkField.innerHTML = totalWork;
}

calculateTotalPrice();

plus.addEventListener("click", () => {
  numberOfPages += 1;
  numField.value = numberOfPages;
  calculateTotalPrice();
});
minus.addEventListener("click", () => {
  if (numberOfPages > 1) {
    numberOfPages -= 1;
    numField.value = numberOfPages;
    calculateTotalPrice();
  }
});

componentPriceOnBtn.addEventListener("click", () => {
  componentPrice = 50;
  calculateTotalPrice();
});
componentPriceOffBtn.addEventListener("click", () => {
  componentPrice = 0;
  calculateTotalPrice();
});

interactionsPriceBasic.addEventListener("click", () => {
  interactionsPrice = 0;
  calculateTotalPrice();
});
interactionsPriceCommon.addEventListener("click", () => {
  interactionsPrice = 50;
  calculateTotalPrice();
});
interactionsPriceRare.addEventListener("click", () => {
  interactionsPrice = 100;
  calculateTotalPrice();
});

myCMSCollections.forEach((x) => {
  x.addEventListener("click", () => {
    setTimeout(() => {
      calculateTotalPrice();
    }, 100);
  });
});
integrationsList.forEach((x) => {
  x.addEventListener("click", () => {
    setTimeout(() => {
      calculateTotalPrice();
    }, 100);
  });
});
