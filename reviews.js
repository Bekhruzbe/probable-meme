// ==========================================
// REVIEWS.JS — mahsulot sharhlari, yulduzcha, rasm
// ==========================================

const F = window.Firebase;
const { db } = F;

// ---------- Cloudinary'ga rasm yuklash ----------
window.uploadToCloudinary = async function (file) {
  const CLOUD_NAME = window.CLOUDINARY_CLOUD_NAME || "YOUR_CLOUD_NAME";
  const PRESET = window.CLOUDINARY_UPLOAD_PRESET || "YOUR_UPLOAD_PRESET";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return data.secure_url;
};

// ---------- Har bir mahsulot uchun sharh bloki chizish ----------
function initReviewsSection(section) {
  const productId = section.dataset.productId;
  let selectedStars = 0;
  let pendingImageFile = null;

  section.innerHTML = `
    <div class="reviewsHeader">
      <h4><i class="fa-solid fa-comments"></i> Sharhlar</h4>
      <div class="reviewsAvg" id="avg-${productId}"></div>
    </div>

    <div id="reviewsList-${productId}" class="reviewsList">
      <p class="reviewsEmpty">Hozircha sharh yo'q. Birinchi bo'lib fikr bildiring!</p>
    </div>

    <button class="writeReviewBtn" id="writeReviewBtn-${productId}">
      <i class="fa-solid fa-pen"></i> Sharh qoldirish
    </button>

    <div class="reviewForm" id="reviewForm-${productId}" style="display:none">

      <div class="starPicker" id="starPicker-${productId}">
        ${[1, 2, 3, 4, 5]
          .map((n) => `<i class="fa-regular fa-star starIcon" data-star="${n}"></i>`)
          .join("")}
      </div>

      <textarea class="reviewTextarea" id="reviewText-${productId}" placeholder="Fikringizni yozing..." rows="3"></textarea>

      <div class="reviewImageRow">
        <label class="reviewImageBtn">
          <i class="fa-solid fa-image"></i> Rasm qo'shish
          <input type="file" accept="image/*" id="reviewImgInput-${productId}" style="display:none">
        </label>
        <span id="reviewImgName-${productId}" class="reviewImgName"></span>
      </div>

      <button class="reviewSubmitBtn" id="reviewSubmitBtn-${productId}">
        <i class="fa-solid fa-paper-plane"></i> Yuborish
      </button>
    </div>
  `;

  const writeBtn = document.getElementById(`writeReviewBtn-${productId}`);
  const form = document.getElementById(`reviewForm-${productId}`);
  const starPicker = document.getElementById(`starPicker-${productId}`);
  const imgInput = document.getElementById(`reviewImgInput-${productId}`);
  const imgNameEl = document.getElementById(`reviewImgName-${productId}`);
  const submitBtn = document.getElementById(`reviewSubmitBtn-${productId}`);

  writeBtn.addEventListener("click", () => {
    if (!window.ShopAuth.requireLogin("Sharh qoldirish uchun avval ro'yxatdan o'ting yoki hisobingizga kiring.")) {
      return;
    }
    form.style.display = form.style.display === "none" ? "flex" : "none";
  });

  starPicker.querySelectorAll(".starIcon").forEach((star) => {
    star.addEventListener("click", () => {
      selectedStars = parseInt(star.dataset.star, 10);
      starPicker.querySelectorAll(".starIcon").forEach((s) => {
        const val = parseInt(s.dataset.star, 10);
        s.classList.toggle("fa-solid", val <= selectedStars);
        s.classList.toggle("fa-regular", val > selectedStars);
        s.classList.toggle("filled", val <= selectedStars);
      });
    });
  });

  imgInput.addEventListener("change", () => {
    pendingImageFile = imgInput.files[0] || null;
    imgNameEl.textContent = pendingImageFile ? pendingImageFile.name : "";
  });

  submitBtn.addEventListener("click", async () => {
    const text = document.getElementById(`reviewText-${productId}`).value.trim();

    if (selectedStars === 0) {
      alert("Iltimos, yulduzcha bilan baholang.");
      return;
    }
    if (!text) {
      alert("Iltimos, sharh matnini yozing.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Yuborilmoqda...";

    try {
      let imageUrl = "";
      if (pendingImageFile) {
        imageUrl = await window.uploadToCloudinary(pendingImageFile);
      }

      const profile = window.ShopAuth.getProfile();
      const user = window.ShopAuth.getUser();

      await F.addDoc(F.collection(db, "reviews"), {
        productId,
        uid: user.uid,
        nickname: profile?.nickname || "Foydalanuvchi",
        photoURL: profile?.photoURL || "",
        stars: selectedStars,
        text,
        reviewImage: imageUrl,
        ownerReply: "",
        createdAt: F.serverTimestamp(),
      });

      form.style.display = "none";
      document.getElementById(`reviewText-${productId}`).value = "";
      imgNameEl.textContent = "";
      pendingImageFile = null;
      selectedStars = 0;
      starPicker.querySelectorAll(".starIcon").forEach((s) => {
        s.classList.remove("fa-solid", "filled");
        s.classList.add("fa-regular");
      });
    } catch (err) {
      alert("Sharh yuborishda xatolik yuz berdi. Qayta urinib ko'ring.");
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Yuborish`;
  });

  // ---------- Real vaqtda sharhlarni tinglash ----------
  const q = F.query(
    F.collection(db, "reviews"),
    F.where("productId", "==", productId),
    F.orderBy("createdAt", "desc")
  );

  F.onSnapshot(q, (snapshot) => {
    renderReviewsList(productId, snapshot.docs);
  });
}

function renderReviewsList(productId, docs) {
  const listEl = document.getElementById(`reviewsList-${productId}`);
  const avgEl = document.getElementById(`avg-${productId}`);

  if (docs.length === 0) {
    listEl.innerHTML = `<p class="reviewsEmpty">Hozircha sharh yo'q. Birinchi bo'lib fikr bildiring!</p>`;
    avgEl.innerHTML = "";
    return;
  }

  const totalStars = docs.reduce((sum, d) => sum + (d.data().stars || 0), 0);
  const avg = (totalStars / docs.length).toFixed(1);
  avgEl.innerHTML = `<i class="fa-solid fa-star"></i> ${avg} <span>(${docs.length} ta sharh)</span>`;

  const isOwner = window.ShopAuth.isOwner();
  const currentUid = window.ShopAuth.getUser()?.uid;

  listEl.innerHTML = docs
    .map((docSnap) => {
      const r = docSnap.data();
      const id = docSnap.id;
      const canDelete = isOwner || r.uid === currentUid;

      const starsHtml = Array.from({ length: 5 })
        .map((_, i) => `<i class="fa-${i < r.stars ? "solid" : "regular"} fa-star"></i>`)
        .join("");

      const avatarSrc =
        r.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.nickname)}`;

      return `
        <div class="reviewItem" data-review-id="${id}">
          <div class="reviewTop">
            <img src="${avatarSrc}" class="reviewAvatar">
            <div class="reviewMeta">
              <span class="reviewNick">${r.nickname}</span>
              <span class="reviewStars">${starsHtml}</span>
            </div>
            ${canDelete ? `<button class="reviewDeleteBtn" data-review-id="${id}"><i class="fa-solid fa-trash"></i></button>` : ""}
          </div>
          <p class="reviewText">${escapeHtml(r.text)}</p>
          ${r.reviewImage ? `<img src="${r.reviewImage}" class="reviewImage">` : ""}
          ${
            r.ownerReply
              ? `<div class="ownerReplyBox"><span class="ownerReplyTag">Behruz (owner) javobi:</span> ${escapeHtml(r.ownerReply)}</div>`
              : ""
          }
          ${
            isOwner && !r.ownerReply
              ? `<button class="ownerReplyBtn" data-review-id="${id}"><i class="fa-solid fa-reply"></i> Javob yozish</button>`
              : ""
          }
        </div>
      `;
    })
    .join("");

  // O'chirish tugmalari
  listEl.querySelectorAll(".reviewDeleteBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Sharhni o'chirmoqchimisiz?")) return;
      await F.deleteDoc(F.doc(db, "reviews", btn.dataset.reviewId));
    });
  });

  // Owner javob yozish tugmalari
  listEl.querySelectorAll(".ownerReplyBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const reply = prompt("Javobingizni yozing:");
      if (!reply) return;
      await F.updateDoc(F.doc(db, "reviews", btn.dataset.reviewId), {
        ownerReply: reply,
      });
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Barcha mahsulot kartalaridagi sharh bloklarini ishga tushirish ----------
function initAllReviews() {
  document.querySelectorAll(".reviewsSection").forEach((section) => {
    initReviewsSection(section);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAllReviews);
} else {
  initAllReviews();
}

// Auth holati o'zgarganda (login/logout) sharhlar ro'yxati
// o'zi qayta chiziladi (onSnapshot orqali), qo'shimcha kod shart emas.
