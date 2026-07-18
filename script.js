/* ==========================
   TELEGRAM USERNAME
   (buyurtma shu username'ga ochiladi)
========================== */
const TELEGRAM_USERNAME = "inomoof";

/* ==========================
   SAVAT (CART) STATE
   Har bir element: { name, color, price, qty }
   key = name + '__' + color orqali aniqlanadi
========================== */
let cart = [];

/* ==========================
   WELCOME -> SHOP
========================== */
const welcome = document.getElementById("welcome");
const enterBtn = document.getElementById("enterBtn");
const brandLogo = document.getElementById("brandLogo");

// Logo: hero (katta, markazda) -> bir oz kutib -> settled (kichikroq, biroz yuqoriroq)
setTimeout(() => {
  brandLogo.classList.remove("hero");
  brandLogo.classList.add("settled");
}, 2300);

enterBtn.addEventListener("click", () => {
  // logotip darhol chap yuqori burchakka "uchib" o'tadi va doimiy shu yerda qoladi
  brandLogo.classList.remove("hero", "settled");
  brandLogo.classList.add("corner");

  welcome.style.display = "none";
  showPage("shop");
});

/* ==========================
   BOTTOM NAVIGATION
========================== */
const pages = {
  shop: document.getElementById("shop"),
  cart: document.getElementById("cart"),
  contact: document.getElementById("contact"),
};

const navBtns = document.querySelectorAll(".navBtn");

function showPage(pageName) {
  Object.keys(pages).forEach((key) => {
    pages[key].style.display = key === pageName ? "block" : "none";
  });

  navBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === pageName);
  });
}

navBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    showPage(btn.dataset.page);
  });
});

/* ==========================
   SLIDER (rasm almashinuvi)
========================== */
const sliderIntervals = new Map();

document.querySelectorAll(".slider").forEach((slider) => {
  const imgs = slider.querySelectorAll("img");
  if (imgs.length <= 1) return;

  let current = 0;

  const intervalId = setInterval(() => {
    imgs[current].classList.remove("active");
    current = (current + 1) % imgs.length;
    imgs[current].classList.add("active");
  }, 3000);

  sliderIntervals.set(slider, intervalId);
});

/* ==========================
   RANG TANLASH (COLOR SELECT)
   -> mos rasmni sliderda ko'rsatadi
========================== */
document.querySelectorAll(".card").forEach((card) => {
  const colorBtns = card.querySelectorAll(".colorBtn");
  const slider = card.querySelector(".slider");
  const imgs = slider.querySelectorAll("img");

  colorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      colorBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // shu rangga mos rasmni doimiy ko'rsatish, avtomatik aylanishni to'xtatish
      const intervalId = sliderIntervals.get(slider);
      if (intervalId) {
        clearInterval(intervalId);
        sliderIntervals.delete(slider);
      }

      const targetImage = btn.dataset.image;
      imgs.forEach((img) => {
        img.classList.toggle("active", img.src === targetImage);
      });
    });
  });
});

/* ==========================
   SAVATGA QO'SHISH
========================== */

document.querySelectorAll(".addCart").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".card");
    const name = card.dataset.name;
    const price = parseInt(card.dataset.price, 10);
    const activeColorBtn = card.querySelector(".colorBtn.active");
    const color = activeColorBtn ? activeColorBtn.dataset.color : "";
    const image = activeColorBtn ? activeColorBtn.dataset.image : "";

    const existing = cart.find(
      (item) => item.name === name && item.color === color
    );

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, color, price, qty: 1, image });
    }

    renderCart();

    btn.textContent = "Qo'shildi ✅";
    setTimeout(() => {
      btn.textContent = "Savatga qo'shish";
    }, 1000);
  });
});

/* ==========================
   SAVATNI CHIZISH (RENDER)
========================== */
const cartItemsBox = document.getElementById("cartItems");
const totalPriceEl = document.getElementById("totalPrice");

function renderCart() {
  cartItemsBox.innerHTML = "";

  if (cart.length === 0) {
    cartItemsBox.innerHTML = "Savat bo'sh";
    totalPriceEl.textContent = "0";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;

    const row = document.createElement("div");
    row.className = "cartRow";

    row.innerHTML = `
      <div class="cartImage">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cartInfo">
        <h4>${item.name}</h4>
        <span class="cartColorTag">${item.color}</span>
        <p class="cartLineTotal">${item.price.toLocaleString("ru-RU")} so'm &times; ${item.qty} = <b>${lineTotal.toLocaleString("ru-RU")} so'm</b></p>
        <div class="cartControls">
          <button class="qtyBtn minusBtn" data-index="${index}">−</button>
          <span class="qtyNumber">${item.qty}</span>
          <button class="qtyBtn plusBtn" data-index="${index}">+</button>
        </div>
      </div>
      <button class="removeBtn" data-index="${index}" title="Bekor qilish">
        <i class="fa-solid fa-trash"></i>
        <span>Bekor qilish</span>
      </button>
    `;

    cartItemsBox.appendChild(row);
  });

  totalPriceEl.textContent = total.toLocaleString("ru-RU");

  attachCartControlEvents();
}

function attachCartControlEvents() {
  document.querySelectorAll(".plusBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.index, 10);
      cart[i].qty += 1;
      renderCart();
    });
  });

  document.querySelectorAll(".minusBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.index, 10);
      cart[i].qty -= 1;
      if (cart[i].qty <= 0) {
        cart.splice(i, 1);
      }
      renderCart();
    });
  });

  document.querySelectorAll(".removeBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.index, 10);
      cart.splice(i, 1);
      renderCart();
    });
  });
}

/* ==========================
   BUYURTMA BERISH -> MANZIL MODALI -> TELEGRAM
========================== */
const orderBtn = document.getElementById("orderBtn");
const orderModal = document.getElementById("orderModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const confirmOrderBtn = document.getElementById("confirmOrderBtn");
const regionSelect = document.getElementById("regionSelect");
const cityInput = document.getElementById("cityInput");
const phoneInput = document.getElementById("phoneInput");
const jizzaxNote = document.getElementById("jizzaxNote");
const cityLabel = document.getElementById("cityLabel");

function isJizzaxShahri() {
  return regionSelect.value === "Jizzax shahri";
}

regionSelect.addEventListener("change", () => {
  if (isJizzaxShahri()) {
    jizzaxNote.classList.add("show");
    cityLabel.textContent = "Yandex orqali mo'ljal / manzil";
    cityInput.placeholder = "Masalan: Katta bozor yonidagi 3-uy, ...";
  } else {
    jizzaxNote.classList.remove("show");
    cityLabel.textContent = "Shahar / Tuman / Mahalla";
    cityInput.placeholder = "Masalan: Bektemir tumani, ...";
  }
});

function openModal() {
  orderModal.classList.add("show");
}

function closeModal() {
  orderModal.classList.remove("show");
}

orderBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Savat bo'sh, avval mahsulot qo'shing!");
    return;
  }
  openModal();
});

closeModalBtn.addEventListener("click", closeModal);

orderModal.addEventListener("click", (e) => {
  if (e.target === orderModal) closeModal();
});

confirmOrderBtn.addEventListener("click", () => {
  const region = regionSelect.value;
  const city = cityInput.value.trim();
  const phone = phoneInput.value.trim();

  let valid = true;

  [regionSelect, cityInput, phoneInput].forEach((el) => {
    el.closest(".modalField").classList.remove("errorField");
  });

  if (!region) {
    regionSelect.closest(".modalField").classList.add("errorField");
    valid = false;
  }
  if (!city) {
    cityInput.closest(".modalField").classList.add("errorField");
    valid = false;
  }
  if (!phone || phone.replace(/\D/g, "").length < 9) {
    phoneInput.closest(".modalField").classList.add("errorField");
    valid = false;
  }

  if (!valid) return;

  let message = "🛍 Yangi buyurtma!\n\n";
  message += "📦 Mahsulotlar:\n";

  let total = 0;

  cart.forEach((item) => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    message += `• ${item.name} (${item.color}) — ${item.qty} dona — ${lineTotal.toLocaleString("ru-RU")} so'm\n`;
  });

  message += `\n💰 Jami: ${total.toLocaleString("ru-RU")} so'm`;

  if (isJizzaxShahri()) {
    message += `\n\n🚀 Yetkazish: Yandex orqali (Jizzax shahri ichida, BEPUL)`;
    message += `\n📍 Mo'ljal/manzil: ${city}`;
  } else {
    message += `\n\n📦 Yetkazish: BTS pochta orqali`;
    message += `\n📍 Manzil: ${region}, ${city}`;
  }

  message += `\n📞 Telefon: ${phone}`;

  const url = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");

  closeModal();
  cart = [];
  renderCart();

  regionSelect.value = "";
  cityInput.value = "";
  phoneInput.value = "";
  jizzaxNote.classList.remove("show");
  cityLabel.textContent = "Shahar / Tuman / Mahalla";
  cityInput.placeholder = "Masalan: Bektemir tumani, ...";
});

/* ==========================
   BOSHLANG'ICH HOLAT
========================== */
showPage("shop");
pages.cart.style.display = "none";
pages.contact.style.display = "none";
renderCart();
