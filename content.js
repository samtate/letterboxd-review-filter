(() => {
  const DEFAULTS = { enabled: true, jokeThreshold: 4, shortReviewWordLimit: 20 };
  const CARD_SELECTOR = "article.production-viewing, li.film-detail, article.review, .review-list-item, .film-detail";
  const BODY_SELECTORS = [".js-review-body", ".body-text", ".review-body", ".-prose"];
  const REVIEW_TERMS = /\b(plot|story|character|acting|actor|performance|director|direction|cinematography|editing|sound|score|music|gameplay|mechanic|level|pacing|ending|scene|dialogue|writing|design|adaptation|camera|visuals|effects|horror|comedy|drama|theme|tone|pace)\b/gi;
  const OPINION_TERMS = /\b(love[ds]?|hate[ds]?|enjoy(?:ed|s)?|great|good|bad|amazing|excellent|awful|fun|beautiful|lovely|boring|favorite|favourite)\b/i;
  let settings = { ...DEFAULTS };

  function reviewBody(card) {
    return BODY_SELECTORS.map((selector) => card.querySelector(selector)).find(Boolean);
  }

  function add(result, points, signal) {
    result.score += points;
    if (signal) result.signals.push(signal);
  }

  function scoreReview(text) {
    const words = text.match(/[\p{L}\p{N}'’-]+/gu) || [];
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    const result = { score: 0, wordCount: words.length, signals: [] };

    if (words.length <= 10) add(result, 3, "very short");
    else if (words.length <= 20) add(result, 2, "short");
    else if (words.length <= 32) add(result, 1);

    if (/\b(pov|me when|literally me|my (?:\w+ )?friend|everyone when|nobody:|when you)\b/i.test(text)) add(result, 2, "reaction format");
    if (/^(this|that|it|he|she|they) (is|was|happened|feels|sounds|really said|really did)\b/i.test(text)) add(result, 1, "anecdotal phrasing");
    if (/^(a|an)\s+(?:[\p{L}'’-]+\s+){1,5}(about|of|for)\b/iu.test(text)) add(result, 1, "one-line premise");
    if (words.length <= 20 && /\b(one|every|random|that one)\b/i.test(text)) add(result, 1, "setup language");
    if (/(?:\b(?:lol|lmao|lmfao|help)\b|[😭💀😂])/i.test(text)) add(result, 2, "reaction marker");
    if (/\b(bro|dawg|dude|bestie|y['’]?all)\b/i.test(text)) add(result, 2, "casual reaction");
    if (/\b(what the fuck|wtf|what the hell)\b/i.test(text)) add(result, 2, "emphatic reaction");
    if (/(?:^|\s)[\p{L}][\p{L}\s]{0,24}:\s/iu.test(text)) add(result, 2, "dialogue format");
    if (/\bshould(?:n['’]t|['’]ve| have)\b[^.!?]{0,70}\blike\b/i.test(text)) add(result, 1, "counterfactual comparison");
    if (sentences.length === 1 && !/[.!?]$/.test(text)) add(result, 1, "caption-like structure");
    if ((/^(why|how|does|did|is|are|what)\b/i.test(text) || /\?/.test(text)) && words.length <= 22) add(result, 1, "one-line question");

    if (OPINION_TERMS.test(text)) add(result, -1);
    const termCount = (text.match(REVIEW_TERMS) || []).length;
    if (termCount >= 2) add(result, -3);
    else if (termCount === 1) add(result, -1);
    if (words.length >= 60) add(result, -3);
    if (sentences.length >= 3) add(result, -2);
    if (/(?:^|\s)[-*•]\s+/m.test(text)) add(result, -2);
    return result;
  }

  function addNotice(card, result, isShort) {
    const notice = document.createElement("div");
    const subtle = isShort || result.score >= settings.jokeThreshold + 2;
    const body = card.querySelector(":scope > .body") || card;
    notice.className = `lb-review-filter-notice${subtle ? " lb-review-filter-notice--subtle" : ""}`;
    if (isShort) notice.append(`Short review hidden — ${result.wordCount} words`);
    else if (subtle) notice.append("Likely joke review hidden");
    else notice.append(`Possible joke review — ${result.signals.slice(0, 2).join(" + ") || "low-substance review"}`);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Show review";
    button.addEventListener("click", () => { card.classList.remove("lb-review-filter-collapsed"); notice.remove(); });
    notice.append(" · ", button);
    body.prepend(notice);
    card.classList.add("lb-review-filter-collapsed");
  }

  function inspect(card) {
    if (card.dataset.lbReviewFilterDone || !settings.enabled) return;
    const body = reviewBody(card);
    const text = body?.textContent.replace(/\s+/g, " ").trim();
    if (!text) return;
    const result = scoreReview(text);
    const isShort = result.wordCount <= settings.shortReviewWordLimit;
    card.dataset.lbReviewFilterDone = "true";
    if (isShort || result.score >= settings.jokeThreshold) addNotice(card, result, isShort);
  }

  function scan(root = document) {
    if (root.matches?.(CARD_SELECTOR)) inspect(root);
    root.querySelectorAll?.(CARD_SELECTOR).forEach(inspect);
  }

  browser.storage.local.get(DEFAULTS).then((saved) => {
    settings = { ...DEFAULTS, ...saved };
    scan();
    new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) scan(node);
    }))).observe(document.documentElement, { childList: true, subtree: true });
  });
})();
