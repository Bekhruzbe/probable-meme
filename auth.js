// ==========================================
// AUTH.JS — ro'yxatdan o'tish / kirish / profil
// ==========================================

const F = window.Firebase;
const { auth, db } = F;

const authBox = document.getElementById("authBox");

let currentUser = null;
let currentProfile = null;

// ---------- Nickname -> ichki "email" (Firebase Auth email talab qiladi) ----------
function nicknameToEmail(nickname) {
  const clean = nickname.trim().toLowerCase().replace(/[^a-z0-9_.]/g, "");
  return `${clean}@onlineshop-uzb.local`;
}

// ---------- window.ShopAuth — script.js va reviews.js shundan foydalanadi ----------
window.ShopAuth = {
  isLoggedIn: () => !!currentUser,
  isOwner: () => !!(currentProfile && currentProfile.isOwner),
  getUser: () => currentUser,
  getProfile: () => currentProfile,
  requireLogin: (message) => {
    if (currentUser) return true;
    alert(message || "Bu amal uchun avval ro'yxatdan o'ting yoki kiring.");
    showPage("profile");
    return false;
  },
};

function showPage(pageName) {
  document.querySelectorAll(".navBtn").forEach((b) => {
    b.classList.toggle("active", b.dataset.page === pageName);
  });
  ["shop", "cart", "contact", "profile"].forEach((key) => {
    const el = document.getElementById(key);
    if (el) el.style.display = key === pageName ? "block" : "none";
  });
}

// ==========================================
// RENDER: LOGIN / REGISTER FORM
// ==========================================
function renderAuthForm() {
  authBox.innerHTML = `
    <div class="authCard">

      <div class="authTabs">
        <button class="authTab active" data-tab="login">Kirish</button>
        <button class="authTab" data-tab="register">Ro'yxatdan o'tish</button>
      </div>

      <div id="authError" class="authError"></div>

      <form id="loginForm" class="authForm">
        <div class="modalField">
          <label>Nik nomi</label>
          <input type="text" id="loginNick" placeholder="masalan: behruz_uz" autocomplete="username">
        </div>
        <div class="modalField">
          <label>Parol</label>
          <input type="password" id="loginPass" placeholder="Parolingiz" autocomplete="current-password">
        </div>
        <button type="submit" class="authSubmit">
          <i class="fa-solid fa-right-to-bracket"></i> Kirish
        </button>
      </form>

      <form id="registerForm" class="authForm" style="display:none">
        <div class="modalField">
          <label>Nik nomi tanlang</label>
          <input type="text" id="regNick" placeholder="masalan: behruz_uz" autocomplete="username">
        </div>
        <div class="modalField">
          <label>Parol o'ylab toping</label>
          <input type="password" id="regPass" placeholder="Kamida 6 ta belgi" autocomplete="new-password">
        </div>
        <button type="submit" class="authSubmit">
          <i class="fa-solid fa-user-plus"></i> Ro'yxatdan o'tish
        </button>
      </form>

      <a href="https://t.me/inomoof" target="_blank" class="forgotLink">
        Parolni unutdingizmi? Telegram orqali yozing
      </a>

    </div>
  `;

  const tabs = authBox.querySelectorAll(".authTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const errorBox = document.getElementById("authError");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      errorBox.textContent = "";
      if (tab.dataset.tab === "login") {
        loginForm.style.display = "flex";
        registerForm.style.display = "none";
      } else {
        loginForm.style.display = "none";
        registerForm.style.display = "flex";
      }
    });
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";
    const nick = document.getElementById("loginNick").value.trim();
    const pass = document.getElementById("loginPass").value;
    if (!nick || !pass) {
      errorBox.textContent = "Nik va parolni kiriting.";
      return;
    }
    try {
      await F.signInWithEmailAndPassword(auth, nicknameToEmail(nick), pass);
    } catch (err) {
      errorBox.textContent = "Nik yoki parol noto'g'ri.";
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";
    const nick = document.getElementById("regNick").value.trim();
    const pass = document.getElementById("regPass").value;

    if (nick.length < 3) {
      errorBox.textContent = "Nik kamida 3 ta belgidan iborat bo'lsin.";
      return;
    }
    if (pass.length < 6) {
      errorBox.textContent = "Parol kamida 6 ta belgidan iborat bo'lsin.";
      return;
    }

    try {
      const cred = await F.createUserWithEmailAndPassword(auth, nicknameToEmail(nick), pass);
      await F.fbUpdateProfile(cred.user, { displayName: nick });
      await F.setDoc(F.doc(db, "users", cred.user.uid), {
        nickname: nick,
        phone: "",
        region: "",
        city: "",
        photoURL: "",
        isOwner: false,
        createdAt: F.serverTimestamp(),
      });
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        errorBox.textContent = "Bu nik allaqachon band ❌ Boshqa nik tanlang.";
      } else if (err.code === "auth/weak-password") {
        errorBox.textContent = "Parol juda oddiy, boshqa parol tanlang.";
      } else {
        errorBox.textContent = "Xatolik yuz berdi, qayta urinib ko'ring.";
      }
    }
  });

}

// ==========================================
// RENDER: PROFILE (logged in)
// ==========================================
function renderProfile() {
  const p = currentProfile || {};
  const ownerBadge = p.isOwner
    ? `<span class="verifiedBadge" title="Sayt egasi"><i class="fa-solid fa-certificate"></i><i class="fa-solid fa-check checkIcon"></i></span>`
    : "";
  const ownerTag = p.isOwner ? ` (owner)` : "";

  authBox.innerHTML = `
    <div class="profileCard">

      <div class="profilePhotoWrap" id="profilePhotoWrap">
        <img id="profilePhotoImg" src="${p.photoURL || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(p.nickname || "U")}" class="profilePhotoImg">
        <div class="photoEditOverlay"><i class="fa-solid fa-camera"></i></div>
        <input type="file" id="profilePhotoInput" accept="image/*" style="display:none">
      </div>

      <h3 class="profileNick">${p.nickname || ""}${ownerTag}${ownerBadge}</h3>
      <p class="profileEmailNote">Hisobingiz xavfsiz saqlanmoqda</p>

      <div class="modalField">
        <label>Telefon raqami</label>
        <input type="tel" id="profPhone" value="${p.phone || ""}" placeholder="+998 90 123 45 67">
      </div>

      <div class="modalField">
        <label>Viloyat / Shahar</label>
        <input type="text" id="profRegion" value="${p.region || ""}" placeholder="Masalan: Jizzax shahri">
      </div>

      <div class="modalField">
        <label>Manzil (Shahar/Tuman/Mahalla)</label>
        <input type="text" id="profCity" value="${p.city || ""}" placeholder="Aniq manzilingiz">
      </div>

      <button id="saveProfileBtn" class="authSubmit">
        <i class="fa-solid fa-floppy-disk"></i> Saqlash
      </button>

      <div id="profileSaveMsg" class="profileSaveMsg"></div>

      <button id="logoutBtn" class="logoutBtn">
        <i class="fa-solid fa-right-from-bracket"></i> Chiqish
      </button>

    </div>
  `;

  document.getElementById("saveProfileBtn").addEventListener("click", async () => {
    const phone = document.getElementById("profPhone").value.trim();
    const region = document.getElementById("profRegion").value.trim();
    const city = document.getElementById("profCity").value.trim();
    const msg = document.getElementById("profileSaveMsg");

    try {
      await F.updateDoc(F.doc(db, "users", currentUser.uid), { phone, region, city });
      currentProfile = { ...currentProfile, phone, region, city };
      msg.textContent = "✅ Saqlandi";
      setTimeout(() => (msg.textContent = ""), 2000);
    } catch (err) {
      msg.textContent = "❌ Xatolik, qayta urinib ko'ring";
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    F.signOut(auth);
  });

  const photoWrap = document.getElementById("profilePhotoWrap");
  const photoInput = document.getElementById("profilePhotoInput");
  photoWrap.addEventListener("click", () => photoInput.click());

  photoInput.addEventListener("change", async () => {
    const file = photoInput.files[0];
    if (!file) return;

    if (window.uploadToCloudinary) {
      photoWrap.classList.add("uploading");
      try {
        const url = await window.uploadToCloudinary(file);
        await F.updateDoc(F.doc(db, "users", currentUser.uid), { photoURL: url });
        currentProfile = { ...currentProfile, photoURL: url };
        document.getElementById("profilePhotoImg").src = url;
      } catch (err) {
        alert("Rasm yuklashda xatolik. Keyinroq urinib ko'ring.");
      }
      photoWrap.classList.remove("uploading");
    }
  });
}

// ==========================================
// AUTH STATE LISTENER
// ==========================================
F.onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (user) {
    const snap = await F.getDoc(F.doc(db, "users", user.uid));
    currentProfile = snap.exists() ? snap.data() : null;
    renderProfile();
  } else {
    currentProfile = null;
    renderAuthForm();
  }

  window.dispatchEvent(new CustomEvent("shop-auth-changed"));
});
