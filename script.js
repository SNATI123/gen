const canvas = document.getElementById("memeCanvas");
const ctx = canvas && canvas.getContext("2d");
let image = new Image();
let isSharingInProgress = false; // contrôle du partage

if (canvas) {
  upload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      image.src = reader.result;
    };
    if (file) reader.readAsDataURL(file);
  });

  function generateMeme() {
    const topText = document.getElementById("topText").value;
    const bottomText = document.getElementById("bottomText").value;
    const font = document.getElementById("fontSelect").value;
    const color = document.getElementById("textColor").value;
    const customFontSize = parseInt(document.getElementById("fontSize").value);

    const renderMeme = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const fontSize = customFontSize || Math.floor(canvas.width / 12);
      ctx.font = `${fontSize}px ${font}`;
      ctx.fillStyle = color;
      ctx.strokeStyle = "black";
      ctx.lineWidth = fontSize / 60;
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
}

function downloadMeme() {
  if (canvas) {
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = canvas.toDataURL();
    link.click();
  }
}

function downloadImage(dataUrl) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "meme.png";
  a.click();
}

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
    alert("Le partage n'est pas pris en charge sur ce navigateur. Veuillez utiliser votre telephone");
  }
}

function shareMeme() {
  if (canvas) {
    const dataUrl = canvas.toDataURL();
    shareImageData(dataUrl);
  }
}

function saveMemeToGallery() {
  if (canvas) {
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
}

function loadGalleryInIndex() {
  // Vérifier si nous sommes sur la page index.html
  if (document.getElementById("upload")) { // Un élément unique à index.html
    const galleryDiv = document.getElementById("gallery");
    galleryDiv.innerHTML = "";
    const gallery = JSON.parse(localStorage.getItem("memes")) || [];
    gallery.forEach((data, index) => {
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

      const downloadBtn = document.createElement("button");
      downloadBtn.textContent = "Télécharger";
      downloadBtn.className = "download-btn";
      downloadBtn.onclick = (e) => {
        e.stopPropagation();
        downloadImage(data);
      };

      wrapper.appendChild(img);
      wrapper.appendChild(shareBtn);
      wrapper.appendChild(downloadBtn);
      galleryDiv.appendChild(wrapper);
    });
  }
}

function loadGallery() {
  const galleryDiv = document.getElementById("gallery");
  galleryDiv.innerHTML = "";
  const gallery = JSON.parse(localStorage.getItem("memes")) || [];
  gallery.forEach((data, index) => {
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

    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Télécharger";
    downloadBtn.className = "download-btn";
    downloadBtn.onclick = (e) => {
      e.stopPropagation();
      downloadImage(data);
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteMeme(index);
    };

    wrapper.appendChild(img);
    wrapper.appendChild(shareBtn);
    wrapper.appendChild(downloadBtn);
    wrapper.appendChild(deleteBtn);
    galleryDiv.appendChild(wrapper);
  });
}

function deleteMeme(index) {
  let gallery = JSON.parse(localStorage.getItem("memes")) || [];
  gallery.splice(index, 1);
  localStorage.setItem("memes", JSON.stringify(gallery));
  loadGallery();
}

function clearGallery() {
  localStorage.removeItem("memes");
  loadGallery();
}

window.onload = () => {
  if (document.getElementById("upload")) {
    loadGalleryInIndex();
  } else {
    loadGallery();
  }
};