//this script runs on the jobs page and handles the job alert modal form submission.

document.addEventListener("DOMContentLoaded", () => {
  const btnAlertSubmit = document.querySelector("#btn-alert-submit");
  const alertBody = document.querySelector("#alert-body");
  const locationNameElement = document.querySelector("#location_name");
  const radiusElement = document.querySelector("#radius-element");
  const dataAlertAantal = document.querySelector("[data-alert-aantal]");
  const dataAlertLocation = document.querySelector("[data-alert-location]");

  let body;

  function getCheckedFsListValues() {
    return Array.from(
      document.querySelectorAll("input[fs-list-value]:checked"),
    ).map((input) => input.getAttribute("fs-list-value"));
  }

  document
    .querySelector('[data-modal-trigger="modal-alert"]')
    .addEventListener("click", function () {
      // do something here
      prepareData();
    });

  function prepareData() {
    const email = document.querySelector("#email")?.value;
    const interval = document.querySelector("#interval")?.value;
    const radius_km = document.querySelector("#distance")?.value;
    const keywords = getCheckedFsListValues();
    const locationName = sessionStorage.getItem("placeLabel") || null;

    dataAlertAantal.textContent = document.querySelector(
      "[fs-list-element=results-count]",
    ).innerText;
    locationNameElement.textContent = locationName || "";
    dataAlertLocation.style.display = locationName ? "flex" : "none";
    radiusElement.textContent = document.querySelector("#distance")?.value;
    const container = document.querySelector("[data-target='job-alert-pills']");
    container.innerHTML = "";
    keywords.forEach((value) => {
      // create tag
      const tag = document.createElement("div");
      tag.className = "jo-tag purple";

      // create text element
      const text = document.createElement("div");
      text.textContent = value;

      // assemble
      tag.appendChild(text);
      container.appendChild(tag);
    });

    body = {
      email,
      portal_url: window.location.hostname,
      keywords,
      location_name: locationName,
      location_lat: parseFloat(sessionStorage.getItem("userLat")),
      location_lng: parseFloat(sessionStorage.getItem("userLng")),
      radius_km,
      frequency: interval || "daily",
    };

    console.log(body);
  }

  // const n8nUrl = "https://n8n.wambay.com/webhook-test/3221dc13-30b2-4d88-ac72-7c90f1b6f436"
  const n8nUrl =
    "https://n8n.wambay.com/webhook/3221dc13-30b2-4d88-ac72-7c90f1b6f436";

  btnAlertSubmit.addEventListener("click", function (e) {
    e.preventDefault();

    prepareData();

    fetch(n8nUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then(function (response) {
        if (response.ok) {
          window.location.href = "/jobs?modal-id=modal-alert-confirm";
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .catch(function (error) {
        console.error("Fetch error:", error);
        alert("Something went wrong.");
      });
  });
}); // DOMContentLoaded
