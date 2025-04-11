const canvas = document.getElementById("memeCanvas");
const ctx = canvas.getContext("2d");
let image = new Image();
let isSharingInProgress = false; // contrôle du partage

// Charger l'image depuis l'input
upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    image.src = reader.result;
  };
  if (file) reader.readAsDataURL(file);
});

// Dessiner l'image + texte
function generateMeme() {
  const topText = document.getElementById("topText").value;
  const bottomText = document.getElementById("bottomText").value;

  const renderMeme = () => {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const fontSize = Math.floor(canvas.width / 12);
    ctx.font = `${fontSize}px Impact`;
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = fontSize / 20;
    ctx.textAlign = "center";

    ctx.fillText(topText, canvas.width / 2, fontSize);
    ctx.strokeText(topText, canvas.width / 2, fontSize);

    ctx.fillText(bottomText, canvas.width / 2, canvas.height - fontSize / 2);
    ctx.strokeText(bottomText, canvas.width / 2, canvas.height - fontSize / 2);

    setTimeout(saveMemeToGallery, 200);
  };

  if (image.complete && image.naturalWidth !== 0) {
    renderMeme();
  } else {
    image.onload = renderMeme;
  }
}

// Télécharger le mème
function downloadMeme() {
  const link = document.createElement("a");
  link.download = "meme.png";
  link.href = canvas.toDataURL();
  link.click();
}

// Partager le mème (générique)
function shareImageData(dataUrl) {
  if (isSharingInProgress) {
    alert("Le partage est déjà en cours. Patiente un instant.");
    return;
  }

  if (navigator.share) {
    isSharingInProgress = true;
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "meme.png", { type: blob.type });
        return navigator.share({
          title: "Mon mème",
          text: "Regarde ce mème génial !",
          files: [file]
        });
      })
      .catch(err => {
        console.error("Erreur lors du partage :", err);
      })
      .finally(() => {
        isSharingInProgress = false;
      });
  } else {
    alert("Le partage n'est pas pris en charge sur ce navigateur.");
  }
}

// Partager le mème courant
function shareMeme() {
  const dataUrl = canvas.toDataURL();
  shareImageData(dataUrl);
}

// Sauvegarde du mème dans la galerie (sans limite)
function saveMemeToGallery() {
  const imgData = canvas.toDataURL("image/jpeg", 0.8);
  if (!imgData || imgData.length < 1000) return;
  let gallery = JSON.parse(localStorage.getItem("memes")) || [];
  gallery.unshift(imgData);
  try {
    localStorage.setItem("memes", JSON.stringify(gallery));
  } catch (e) {
    console.warn("Impossible d'enregistrer le mème (quota dépassé)");
  }
  loadGallery();
}

// Affichage de la galerie
function loadGallery() {
  const galleryDiv = document.getElementById("gallery");
  galleryDiv.innerHTML = "";
  const gallery = JSON.parse(localStorage.getItem("memes")) || [];
  gallery.forEach(data => {
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-item";

    const img = document.createElement("img");
    img.src = data;

    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Partager";
    shareBtn.className = "share-btn";
    shareBtn.onclick = (e) => {
      e.stopPropagation();
      shareImageData(data);
    };

    wrapper.appendChild(img);
    wrapper.appendChild(shareBtn);
    galleryDiv.appendChild(wrapper);
  });
}

// Vider la galerie
function clearGallery() {
  localStorage.removeItem("memes");
  loadGallery();
}

// Charger la galerie au démarrage
window.onload = loadGallery;