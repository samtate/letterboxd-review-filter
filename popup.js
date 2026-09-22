const DEFAULTS = { enabled: true, jokeThreshold: 4, shortReviewWordLimit: 20 };
const enabled = document.querySelector("#enabled");
const threshold = document.querySelector("#threshold");
const thresholdValue = document.querySelector("#threshold-value");
const shortLimit = document.querySelector("#short-review-word-limit");
const shortLimitValue = document.querySelector("#short-review-word-limit-value");

function updateOutput(output, value) { output.value = value; output.textContent = value; }

browser.storage.local.get(DEFAULTS).then((settings) => {
  enabled.checked = settings.enabled;
  threshold.value = settings.jokeThreshold;
  shortLimit.value = settings.shortReviewWordLimit;
  updateOutput(thresholdValue, settings.jokeThreshold);
  updateOutput(shortLimitValue, settings.shortReviewWordLimit);
});

enabled.addEventListener("change", () => browser.storage.local.set({ enabled: enabled.checked }));
threshold.addEventListener("input", () => updateOutput(thresholdValue, threshold.value));
threshold.addEventListener("change", () => browser.storage.local.set({ jokeThreshold: Number(threshold.value) }));
shortLimit.addEventListener("input", () => updateOutput(shortLimitValue, shortLimit.value));
shortLimit.addEventListener("change", () => browser.storage.local.set({ shortReviewWordLimit: Number(shortLimit.value) }));
