const photos = [
  {
    id: "me2",
    title: "Lumière du quotidien",
    description: "Un portrait au naturel, entre lumière, calme et simplicité.",
    alt: "Portrait dans une lumière naturelle",
    url: "https://res.cloudinary.com/bxhhwnfz/image/upload/me2"
  },
  {
    id: "ME3",
    title: "Un instant à soi",
    description: "Un moment capturé sur le vif, une histoire sans mise en scène.",
    alt: "Portrait spontané d'un instant du quotidien",
    url: "https://res.cloudinary.com/bxhhwnfz/image/upload/ME3"
  },
  {
    id: "me1",
    title: "Au fil du jour",
    description: "L'architecture et la lumière encadrent ce souvenir.",
    alt: "Portrait dans son environnement",
    url: "https://res.cloudinary.com/bxhhwnfz/image/upload/me1"
  },
  {
    id: "ME4",
    title: "Sur le chemin",
    description: "Une image de voyage, avec la ville pour décor.",
    alt: "Portrait en extérieur lors d'une promenade",
    url: "https://res.cloudinary.com/bxhhwnfz/image/upload/ME4"
  },
  {
    id: "me",
    title: "Le souvenir",
    description: "L'instant se transforme en souvenir que l'on aime retrouver.",
    alt: "Souvenir photographique de la collection",
    url: "https://res.cloudinary.com/bxhhwnfz/image/upload/me"
  }
];

const grid = document.querySelector("#gallery-grid");
const search = document.querySelector("#gallery-search");
const status = document.querySelector("#gallery-status");
const emptyState = document.querySelector("#gallery-empty");
const dialog = document.querySelector("#photo-dialog");
const dialogImageFrame = document.querySelector("#dialog-image-frame");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const dialogId = document.querySelector("#dialog-id");
const dialogUrl = document.querySelector("#dialog-url");
const dialogFeedback = document.querySelector("#dialog-feedback");
const copyButton = document.querySelector("#copy-url");
const downloadButton = document.querySelector("#download-image");
const count = document.querySelector("#photo-count");

let activePhoto = null;
let previouslyFocusedElement = null;

function isCloudinaryUrl(value) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

function makeFallback(photo) {
  const fallback = document.createElement("span");
  fallback.className = "photo-card__fallback";

  const mark = document.createElement("span");
  mark.className = "photo-card__fallback-mark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = "F.";

  const title = document.createElement("strong");
  title.textContent = photo.title;

  const hint = document.createElement("span");
  hint.textContent = photo.url
    ? "Cette image ne peut pas être chargée. Vérifiez son URL Cloudinary."
    : `Ajoutez l’URL publique Cloudinary de « ${photo.id} » dans app.js.`;

  fallback.append(mark, title, hint);
  return fallback;
}

function makePhotoImage(photo) {
  if (!isCloudinaryUrl(photo.url)) return makeFallback(photo);

  const image = document.createElement("img");
  image.className = "photo-card__image";
  image.alt = photo.alt;
  image.loading = "lazy";
  image.decoding = "async";
  image.src = photo.url;
  image.addEventListener("error", () => {
    const fallback = makeFallback(photo);
    fallback.classList.add("photo-card__fallback--inline");
    image.replaceWith(fallback);
  }, { once: true });

  return image;
}

function makeCard(photo, index) {
  const article = document.createElement("article");
  article.className = "photo-card";

  const openButton = document.createElement("button");
  openButton.className = "photo-card__open";
  openButton.type = "button";
  openButton.setAttribute("aria-label", `Découvrir ${photo.title}`);
  openButton.append(makePhotoImage(photo));
  openButton.addEventListener("click", () => openPhoto(photo, openButton));

  const meta = document.createElement("div");
  meta.className = "photo-card__meta";

  const copy = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "photo-card__title";
  title.textContent = photo.title;

  const description = document.createElement("p");
  description.className = "photo-card__description";
  description.textContent = photo.description;

  copy.append(title, description);

  const number = document.createElement("span");
  number.className = "photo-card__number";
  number.setAttribute("aria-label", `Image ${index + 1}`);
  number.textContent = String(index + 1).padStart(2, "0");

  meta.append(copy, number);
  article.append(openButton, meta);

  if (!isCloudinaryUrl(photo.url)) {
    const badge = document.createElement("span");
    badge.className = "photo-card__status";
    badge.textContent = photo.url ? "URL À VÉRIFIER" : "LIEN À AJOUTER";
    article.append(badge);
  }

  return article;
}

function renderGallery(query = "") {
  const normalizedQuery = query.trim().toLocaleLowerCase("fr");
  const visiblePhotos = photos.filter((photo) => (
    `${photo.title} ${photo.description} ${photo.id}`.toLocaleLowerCase("fr").includes(normalizedQuery)
  ));

  grid.replaceChildren(...visiblePhotos.map((photo) => makeCard(photo, photos.indexOf(photo))));
  emptyState.hidden = visiblePhotos.length > 0;

  const configuredCount = photos.filter((photo) => isCloudinaryUrl(photo.url)).length;
  count.textContent = String(photos.length).padStart(2, "0");
  status.textContent = `${visiblePhotos.length} image${visiblePhotos.length > 1 ? "s" : ""} · ${
    configuredCount === photos.length
      ? "collection Cloudinary complète"
      : `${configuredCount}/${photos.length} lien${configuredCount > 1 ? "s" : ""} Cloudinary configuré${configuredCount > 1 ? "s" : ""}`
  }`;
}

function openPhoto(photo, trigger) {
  activePhoto = photo;
  previouslyFocusedElement = trigger;
  dialogTitle.textContent = photo.title;
  dialogDescription.textContent = photo.description;
  dialogId.textContent = `IMAGE · ${photo.id}`;
  dialogUrl.textContent = isCloudinaryUrl(photo.url) ? photo.url : "URL Cloudinary non renseignée";
  dialogFeedback.textContent = "";
  copyButton.disabled = !isCloudinaryUrl(photo.url);
  downloadButton.disabled = !isCloudinaryUrl(photo.url);
  dialogImageFrame.replaceChildren(makePhotoImage(photo));
  dialog.showModal();
  document.querySelector("#dialog-close").focus();
}

function closeDialog() {
  if (dialog.open) dialog.close();
  previouslyFocusedElement?.focus();
}

async function copyActiveUrl() {
  if (!activePhoto || !isCloudinaryUrl(activePhoto.url)) return;

  try {
    await navigator.clipboard.writeText(activePhoto.url);
    dialogFeedback.textContent = "Adresse copiée dans le presse-papiers.";
  } catch {
    dialogFeedback.textContent = "Copie refusée par le navigateur. Sélectionnez l’adresse ci-dessus pour la copier.";
  }
}

async function downloadActivePhoto() {
  if (!activePhoto || !isCloudinaryUrl(activePhoto.url)) return;

  downloadButton.disabled = true;
  dialogFeedback.textContent = "Préparation du téléchargement…";

  try {
    const response = await fetch(activePhoto.url, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`Le serveur a répondu avec le statut ${response.status}.`);
    }

    const imageBlob = await response.blob();
    const objectUrl = URL.createObjectURL(imageBlob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${activePhoto.id}.${imageBlob.type.split("/")[1] || "jpg"}`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    dialogFeedback.textContent = "Téléchargement commencé.";
  } catch (error) {
    dialogFeedback.textContent = "Téléchargement impossible : vérifiez que l’image est publique et que Cloudinary autorise son accès.";
    console.error("Échec du téléchargement Cloudinary :", error);
  } finally {
    downloadButton.disabled = false;
  }
}

search.addEventListener("input", () => renderGallery(search.value));
document.querySelector("#dialog-close").addEventListener("click", closeDialog);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeDialog();
});
dialog.addEventListener("close", () => previouslyFocusedElement?.focus());
copyButton.addEventListener("click", copyActiveUrl);
downloadButton.addEventListener("click", downloadActivePhoto);

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !dialog.open && document.activeElement !== search) {
    event.preventDefault();
    search.focus();
  }
});

renderGallery();
