const api_path = "amber-hexschool";
const url = "https://livejs-api.hexschool.io";
const config = {
  headers:{
    Authorization: 'qnXsgVuzzjgj31nwrtDIxGGi4tC3'
  }
}


const productList = document.querySelector(".js-productList");
const productSelect = document.querySelector(".js-productSelect");
const addCartBtn = document.querySelector(".js-addCartBtn");
const cartList = document.querySelector(".js-cartList");
const totalPrice = document.querySelector(".js-totalPrice");
const deleteItemBtn = document.querySelector(".js-deleteItemBtn");
const clearAllProductBtn = document.querySelector(".js-clearAllProductBtn");
const orderBtn = document.querySelector(".js-orderBtn")


let productDataList = [];
let cartDataList = [];

//初始化
function init(){ 
  getProductList();
  getCartList();
}
init();

//取得產品列表
function getProductList(){
  axios.get(`${url}/api/livejs/v1/customer/${api_path}/products`)
    .then(function (res) {
      console.log(res);
      productDataList = res.data.products;
      renderProduct(productDataList);
    }).catch(function (err) {
      console.log(err);
    })
}
    
//渲染產品列表
function renderProduct(productDataList) {
  let str ='';
  productDataList.forEach(function(item){
    str +=`<li class="col-6 col-md-4 col-lg-3 position-relative">
    <div>
    <h5 class="bg-dark text-white position-absolute position px-4 py-2">新品</h5>
    <img src="${item.images}">
    <button type="button" data-id="${item.id}" class="btn btn-dark rounded-0 w-100 fs-5 js-addCartBtn py-2 mb-2">加入購物車</button>
  </div>
    <h5 class="fw-bold">${item.title}</h5>
    <del class="">NT$${toThousands(item.origin_price)}</del>
    <h5 class="fw-bold">NT$${toThousands(item.price)}</h5>
  </li>`
  })
  productList.innerHTML = str;
}
//篩選產品品項
productSelect.addEventListener('change', filterProduct);
function filterProduct(e){
  e.preventDefault(); //擋跳轉
  let category = e.target.value;
  productDataList.forEach(function(item){
  if (category === "全部"){
    renderProduct(productDataList);
  }else if(category === item.category){
    categoryChange(category);
  }
  })
}
function categoryChange(category){
  let filterData = [];
  filterData = productDataList.filter((item) => item.category === category);
  renderProduct(filterData);
}


//加入購物車
productList.addEventListener("click",function(e){
  e.preventDefault(); //檔跳轉
  let id = e.target.dataset.id;
  let num = 1;
  //重複加入同商品時數量加一
  cartDataList.forEach(function (item) {
    if (item.product.id === id) {
        num = item.quantity += 1;
    }
  })
  if(e.target.classList.contains("js-addCartBtn")){
    addCart(id,num);
    return;
  }
})
function addCart(id,num){
  axios.post(`${url}/api/livejs/v1/customer/${api_path}/carts`,{
    "data": {
      "productId":id,
      "quantity": num
    }
  })
  .then(function (res) {
    alert("成功加入購物車")
    getCartList();
  }).catch(function (err) {
    console.log(err);
  })
}

//顯示購物車列表
function getCartList(){
  axios.get(`${url}/api/livejs/v1/customer/${api_path}/carts`)
  .then(function (res) {
    cartDataList = res.data.carts;
    //購物車總額
    let finalTotal = res.data.finalTotal;
    renderCartList(cartDataList,finalTotal);
  }).catch(function (err) {
    console.log(err);
  })
}

//渲染購物車列表
function renderCartList(cartDataList,finalTotal){
  let str ='';
  if (cartDataList.length === 0) {
    cartList.innerHTML = `<div class="fs-4 text-center text-main py-3">目前尚未有訂單</div>`;
    totalPrice.textContent = `NT$${toThousands(finalTotal)}`;

    // 新增按鈕 disabled 狀態
    clearAllProductBtn.classList.add('disabled');
    getCartList();
  } else {
    // 移除按鈕 disabled 狀態
    clearAllProductBtn.classList.remove('disabled');
    cartDataList.forEach(function(item){
    str+=`<li class="d-flex justify-content-center align-items-center border-bottom pb-2">
      <div class="col-4 d-flex align-items-center">
              <img class="d-none d-md-flex cartImg me-3" src="${item.product.images}">
              <img class=" d-md-none cartImg" data-bs-toggle="tooltip" data-bs-placement="right" title=${item.product.title} src="${item.product.images}">
              <p class="d-none d-md-flex m-0">${item.product.title}</p>
      </div>
      <div class="col-2">
          <span>NT$${toThousands(item.product.price)}</span>
      </div>
      <div class="col-2">
          <button class="js-modify-remove material-icons btn text-dark p-0" ${quantityStatus(item.quantity)} data-id="${item.product.id}" data-num="${item.quantity}">remove</button>
          ${item.quantity}
          <button class="js-modify-add material-icons btn text-dark p-0" data-id="${item.product.id}" data-num="${item.quantity}">add</button>
      </div>
      <div class="col-2">NT$${toThousands(item.product.price)}</div>
      <div class="col-2 d-flex justify-content-center">
          <button type="button" class="btn js-deleteItemBtn material-icons text-dark fs-2" data-id="${item.id}">close
          </button>
      </div>
  </li>`
  })
  totalPrice.textContent = `NT$${toThousands(finalTotal)}`;
  cartList.innerHTML = str;
  }
}

//修改數量、刪除單一
cartList.addEventListener('click',function(e) {
  e.preventDefault(); //擋跳轉
  let id = e.target.dataset.id;
  let num = e.target.dataset.num;
  if(e.target.classList.contains("js-deleteItemBtn")){
    deleteCartItem(id);
    return;
  }
  if(e.target.classList.contains("js-modify-remove")){
    updateQun('remove',num ,id);
    return;
  }
  if(e.target.classList.contains("js-modify-add")){
    updateQun('add',num ,id);
    return;
  }
})


// 數量等於一時減號按鈕不可按
function quantityStatus(quantity) {
  if (quantity === 1) {
    return `disabled`;
  } else {
    return;
  } 
}
//購物車產品數量修改
function updateQun(status,num,id){
  if (status === 'add') {
    cartDataList.forEach(function(item){
     num = item.quantity +=1;
    })
  } else {
    if (num > 1) {
      cartDataList.forEach(function(item){
        num = item.quantity -=1;
      })
    }
  }
  axios.post(`${url}/api/livejs/v1/customer/${api_path}/carts`,{
    "data": {
      "productId":id,
      "quantity": num
    }
  })
  .then(function (res) {
    console.log(res);
    getCartList();
  }).catch(function (err) {
    console.log(err);
  })
}

//刪除單一產品
function deleteCartItem(id){
  axios.delete(`${url}/api/livejs/v1/customer/${api_path}/carts/${id}`)
  .then(function (res) {
    alert("刪除該產品成功");
    getCartList();
  }).catch(function (err) {
    console.log(err);
  })
}

//刪除所有品項
clearAllProductBtn.addEventListener('click',clearAllCart);
function clearAllCart(){
  axios.delete(`${url}/api/livejs/v1/customer/${api_path}/carts`)
  .then(function (res) {
    alert("刪除全部產品成功");
    getCartList();
  }).catch(function (err) {
    console.log(err);
    alert("目前尚未有產品!");
  })
}


//送出訂單資料
orderBtn.addEventListener('click', orderCreate);
function orderCreate(e){
  e.preventDefault();
  if (cartDataList.length == 0){
    alert("購物車內尚未有產品");
    return;
  }
  const validationName = document.querySelector("#validationName").value.trim();
  const validationTel = document.querySelector("#validationTel").value.trim();
  const validationEmail = document.querySelector("#validationEmail").value.trim();
  const validationAddress = document.querySelector("#validationAddress").value.trim();
  const tradeWay = document.querySelector("#tradeWay").value;
  if(validationName == "" || validationTel == "" || validationEmail  == "" || validationAddress  == "" || tradeWay == "" ){
    alert("訂單資料不可輸入空值");
    return;
  }
  if (validateName(validationName) == false){
    alert("請填寫正確的姓名");
    return;
  }
  if (validatePhone(validationTel) == false){
    alert("請填寫正確的電話");
    return;
  }
  if (validateEmail(validationEmail) == false){
    alert("請填寫正確的Email");
    return;
  }
  axios.post(`${url}/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
      "user": {
        "name": validationName,
        "tel": validationTel,
        "email": validationEmail,
        "address": validationAddress,
        "payment":tradeWay
      }
    }
  })
    .then(function (res) {
      alert("訂單建立成功");
      document.querySelector("#validationName").value = "";
      document.querySelector("#validationTel").value = "";
      document.querySelector("#validationEmail").value = "";
      document.querySelector("#validationAddress").value = "";
      document.querySelector("#tradeWay").value = "";
      getCartList();
    }).catch(function (err) {
      console.log(err);
      alert("購物車內尚未有產品!");
    })
}

//驗證名字、手機、信箱
const validationName = document.querySelector("#validationName");
validationName.addEventListener("blur",function(e){
  if (validateName(validationName.value) == false) {
    document.querySelector(`[data-message=name]`).textContent = "*不可含特殊字元及數字且中英不可同時輸入";
    return;
  }
  if (validateName(validationName.value) == true) {
    document.querySelector(`[data-message=name]`).textContent = "";
    return;
  }
})
const validationTel = document.querySelector("#validationTel");
validationTel.addEventListener("blur",function(e){
  if (validatePhone(validationTel.value) == false) {
    document.querySelector(`[data-message=phone]`).textContent = "*電話格式錯誤";
    return;
  }
  if (validatePhone(validationTel.value) == true) {
    document.querySelector(`[data-message=phone]`).textContent = "";
    return;
  }
})
const validationEmail = document.querySelector("#validationEmail");
validationEmail.addEventListener("blur",function(e){
  if (validateEmail(validationEmail.value) == false) {
    document.querySelector(`[data-message=email]`).textContent = "*Email格式錯誤";
    return;
  }
  if (validateEmail(validationEmail.value) == true) {
    document.querySelector(`[data-message=email]`).textContent = "";
    return;
  }
})


//Back-to-top
//Get the button
let backTopBtn = document.getElementById("btn-back-to-top");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (
    document.body.scrollTop > 20 ||
    document.documentElement.scrollTop > 20
  ) {
    backTopBtn.style.display = "block";
  } else {
    backTopBtn.style.display = "none";
  }
}
// When the user clicks on the button, scroll to the top of the document
backTopBtn.addEventListener("click", backToTop);

function backToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}





//圖片提示字 Bootstrap
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})