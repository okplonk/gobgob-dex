let allCards = [];
let showMissing = true;

async function fetchCards() {
  const res = await fetch("cards.csv");
  const text = await res.text();
  const lines = text.trim().split("\n").slice(1);
  return lines.map(line => {
    const [id, nom, rarete] = line.split(",");
    return { id: parseInt(id), name: nom.trim(), rarity: rarete.trim().toLowerCase() };
  });
}

async function fetchCollection() {
  const res = await fetch("collection.csv");
  const text = await res.text();
  const lines = text.trim().split("\n").slice(1);
  return lines.map(line => {
    const [pseudo, id] = line.split(",");
    return { pseudo: pseudo.trim().toLowerCase(), id: parseInt(id) };
  });
}

function addTiltEffect(card) {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -(y - centerY) / 3;
    const rotateY = (x - centerX) / 3;
    card.querySelector('.card-inner').style.transform =
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  });

  card.addEventListener("mouseleave", () => {
    card.querySelector('.card-inner').style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

function addZoomEffect(cardId, rarity) {
  const popup = document.getElementById("popup");
  const inner = document.getElementById("popup-inner");
  inner.style.backgroundImage = `url(img/${cardId}.png)`;
  inner.className = "popup-card-inner " + rarity.toLowerCase();
  popup.classList.add("visible");

  inner.addEventListener("mousemove", e => {
    const rect = inner.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -(y - centerY) / 6;
    const rotateY = (x - centerX) / 6;
    inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  });

  inner.addEventListener("mouseleave", () => {
    inner.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

function hidePopup() {
  document.getElementById("popup").classList.remove("visible");
}

async function loadCollection() {
  const username = document.getElementById("username").value.toLowerCase();
  const collection = await fetchCollection();
  const owned = new Set(
    collection.filter(entry => entry.pseudo === username).map(entry => entry.id)
  );
  const container = document.getElementById("cards");
  container.innerHTML = "";

  let index = 0;
  for (const card of allCards) {
    const div = document.createElement("div");
    div.className = "card";
    div.style.animationDelay = `${index * 50}ms`;

    const inner = document.createElement("div");
    inner.className = "card-inner";
    inner.style.backgroundImage = `url(img/${card.id}.png)`;
    inner.title = `${card.name} (${card.rarity})`;
    div.appendChild(inner);

    const isOwned = owned.has(card.id);
    if (!isOwned) {
      div.classList.add("missing");
      if (!showMissing) div.classList.add("hidden");
    } else {
      addTiltEffect(div);
      div.onclick = () => addZoomEffect(card.id, card.rarity);
    }

    container.appendChild(div);
    index++;
  }

  const ownedCount = owned.size;
  const totalCount = allCards.length || 1;
  const percent = (ownedCount / totalCount) * 100;
  document.getElementById("progress-text").textContent =
    `${ownedCount} carte${ownedCount !== 1 ? "s" : ""} débloquée${ownedCount !== 1 ? "s" : ""} sur ${totalCount}`;
  document.getElementById("progress-bar").style.width = percent + "%";
}

function toggleMissing() {
  showMissing = !showMissing;
  document.querySelectorAll(".card.missing").forEach(card => {
    card.classList.toggle("hidden", !showMissing);
  });
}

// Initialisation
fetchCards().then(cards => allCards = cards);
