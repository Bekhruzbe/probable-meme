// ===============================
// WELCOME SCREEN
// ===============================

const enterBtn = document.getElementById("enterBtn");
const welcome = document.getElementById("welcome");
const shop = document.getElementById("shop");

enterBtn.addEventListener("click", () => {

    welcome.style.opacity = "0";
    welcome.style.transition = "1s";

    setTimeout(() => {

        welcome.style.display = "none";
        shop.style.display = "block";

    },1000);

});


// ===============================
// PAGE NAVIGATION
// ===============================

const navButtons = document.querySelectorAll(".navBtn");

const pages = {
    shop: document.getElementById("shop"),
    cart: document.getElementById("cart"),
    contact: document.getElementById("contact")
};


navButtons.forEach(button => {

    button.addEventListener("click",()=>{

        let page = button.dataset.page;


        Object.values(pages).forEach(item=>{

            item.style.display="none";

        });


        pages[page].style.display="block";


        navButtons.forEach(btn=>{

            btn.classList.remove("active");

        });


        button.classList.add("active");


    });


});



// ===============================
// SHOPPING CART
// ===============================


let cart = [];


const addButtons = document.querySelectorAll(".addCart");


addButtons.forEach(button=>{


button.addEventListener("click",()=>{


let card = button.parentElement;


let name = card.querySelector("h3").innerText;


let priceText = card.querySelector(".price").innerText;


let price = Number(
priceText.replace(/\D/g,"")
);



let product = {

name:name,

price:price,

quantity:1

};



let exist = cart.find(item=>item.name===name);



if(exist){

exist.quantity++;

}

else{

cart.push(product);

}



updateCart();


alert("Mahsulot savatchaga qo'shildi 🛒");


});


});




// ===============================
// UPDATE CART
// ===============================


function updateCart(){


const cartBox = document.getElementById("cartItems");



if(cart.length===0){

cartBox.innerHTML="Savatcha bo'sh";

document.getElementById("totalPrice").innerText=0;

return;

}



let html="";

let total=0;



cart.forEach((item,index)=>{


total += item.price * item.quantity;


html += `

<div class="cart-item">

<h3>${item.name}</h3>

<p>
${item.quantity} dona
</p>

<p>
${item.price * item.quantity} so'm
</p>


<button onclick="removeItem(${index})">

❌

</button>


</div>

`;


});



cartBox.innerHTML=html;


document.getElementById("totalPrice").innerText=
total.toLocaleString();



}




// ===============================
// REMOVE CART ITEM
// ===============================


function removeItem(index){


cart.splice(index,1);


updateCart();


}



// ===============================
// ORDER BUTTON
// ===============================


const orderBtn =
document.getElementById("orderBtn");



orderBtn.addEventListener("click",()=>{


if(cart.length===0){

alert("Avval mahsulot tanlang!");

return;

}



let message=" Assalomu alaykum!\n🛒 Yangi buyurtma\n\n";


cart.forEach(item=>{


message += 
`
⌚ ${item.name}
📦 ${item.quantity} dona
💰 ${item.price * item.quantity} so'm

`;

});


message +=
`
Jami:
${document.getElementById("totalPrice").innerText} so'm
`;



// hozircha Telegram chat ochadi

let telegramURL =
"https://t.me/inomoof?text="
+
encodeURIComponent(message);



window.open(telegramURL,"_blank");



});




// ===============================
// PAGE START
// ===============================


window.onload=()=>{


shop.style.display="none";

pages.cart.style.display="none";

pages.contact.style.display="none";


};
