const api_path = "amber-hexschool";
const url = "https://livejs-api.hexschool.io";
const config = {
  headers:{
    Authorization: 'qnXsgVuzzjgj31nwrtDIxGGi4tC3'
  }
}

const orderListItem = document.querySelector('.js-orderListItem');
const clearAllBtn = document.querySelector('.js-clearAllBtn');
const btnGroup = document.querySelectorAll('.js-btnGroup');
const chart = document.querySelector('#js-chart');
const chartTitle = document.querySelector('.js-chartTitle');
const modelList = document.querySelector('.js-modelList');

let orderData = [];

//初始化
function init(){
  getOrderList();
}
init();

//取得訂單列表 GET
function getOrderList(){
  axios.get(`${url}/api/livejs/v1/admin/${api_path}/orders`,config)
    .then(function(res){
      //console.log(res);
      orderData = res.data.orders;
      renderOrder();
    }).catch(function (err) {
      console.log(err);
    })
}

// 渲染訂單列表
function renderOrder(){
  let str ='';
  orderData.forEach((item,index) =>{
     // 組時間字串
    const timeStamp = new Date(item.createdAt*1000); //時間戳 帶進訂單參數*1000變為毫秒13碼
    const orderDate = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`; 
    //getMonth+1是因為從0開始算1月
    str += `<tr class="text-center">
    <td>${item.id}</td>
    <td>${item.user.name}${item.user.tel}</td>
    <td>${item.user.address}</td>
    <td>${item.user.email}</td>
    <td>
      <a href="#" class="text-main js-showOrder" data-bs-toggle="modal" data-bs-target="#exampleModal" data-index="${index}">查看訂單</a>
    </td>
    <td>${orderDate}</td>
    <td class="js-orderStatus">
      <a href="#"  class="text-main orderStatus" data-id="${item.id}" data-status="${item.paid}">${item.paid ? '已處理' : '未處理'}</a>
    </td>
    <td>
      <button type="button" class="btn btn-danger delOrderBtn" data-id="${item.id}">刪除</button>
    </td>
</tr>`;
  });
  orderListItem.innerHTML = str;
  productAllRatio(orderData);
}

// 顯示訂單品項
function showOrderList(index){
  let str ='';
  const modelTotal = document.querySelector('.js-modelTotal')
  let totalStr = '';
  console.log(index);
  orderData[index].products.forEach(item=>{
    str += `<tr class="text-center">
    <td width="20%"><img src=${item.images} width="100%"></td>
    <td width="30%">${item.title}</td>
    <td width="10%">${item.quantity}</td>
    <td width="20%">NT$${toThousands(item.price*item.quantity)}</td>
</tr>`;
    totalStr = `<div class="text-end fw-bold mt-3">總金額 <span>NT$${toThousands(orderData[index].total)}</span></div>`
  });
  modelList.innerHTML = str;
  modelTotal.innerHTML = totalStr;
}

//修改、刪除單一
orderListItem.addEventListener("click",function(e){
  e.preventDefault(); //檔跳轉
  let id = e.target.dataset.id;
  if(e.target.classList.contains("delOrderBtn")){
    deleteOrderItem(id);
    return;
  }
  if(e.target.classList.contains("orderStatus")){
    let status = e.target.dataset.status;
    changeStatus(status,id);
    return;
  }
  if(e.target.classList.contains("js-showOrder")){
    let index = e.target.dataset.index;
    showOrderList(index);
    return;
  }
})

// 修改訂單狀態 PUT
function changeStatus(status ,id){
  console.log(status,id);
  let newStatus;
  if(status == 'true'){
    newStatus = false;
  }else{
    newStatus = true;
  }
  axios.put(`${url}/api/livejs/v1/admin/${api_path}/orders`, {
    "data": {
      "id": id,
      "paid": newStatus
    }
  },config)
  .then(function(res){
    alert("修改訂單成功");
    getOrderList();
  }).catch(function (err) {
    console.log(err);
  })
}

// 刪除特定訂單 DELETE
function deleteOrderItem(id){
  axios.delete(`${url}/api/livejs/v1/admin/${api_path}/orders/${id}`,config)
  .then(function(res) {
    alert("刪除該筆訂單成功");
    getOrderList();
  }).catch(function (err) {
    console.log(err);
  })
}
// 刪除全部訂單 DELETE
clearAllBtn.addEventListener("click",clearAllOrder);
function clearAllOrder(){
  axios.delete(`${url}/api/livejs/v1/admin/${api_path}/orders`,config)
  .then(function(res) {
    alert("刪除全部訂單成功");
    getOrderList();
  }).catch(function (err) {
    console.log(err);
    alert("目前尚未有訂單!");
  })
}

//圖表切換按鈕
const btnAll = document.querySelectorAll('.js-btnGroup button');
let toggleBtn = "allProduct"; //預設顯示狀態為全品項營收比重
btnGroup.forEach(function (item) {
  item.addEventListener('click', toggleChart);
})
function toggleChart(e) {
  let chartText = e.target.textContent;
  
  btnAll.forEach(function (item) {
      item.classList.remove("active");//透過 classList.remove 移除全部的active 樣式
  })
  e.target.classList.add("active"); //有被點擊到的才加 class 樣式
  toggleBtn = e.target.dataset.tab;
  if (toggleBtn) {
      // 標題
      chartTitle.textContent = chartText;
      // 圖表
      if (toggleBtn === 'productCategory') {
        productCategoryRatio(orderData);
      } else {
        productAllRatio(orderData);
      }
  }
}



// 全品項營收比重
function productAllRatio(orderData){
  if (orderData.length === 0) {
    chart.innerHTML = `<div class="h4 text-main py-5">目前尚未有訂單</div>`;
  } else {
      let obj = {};
      orderData.forEach(function (item) {
          item.products.forEach(function (productItem) {
              if (obj[productItem.title] === undefined) {
                  obj[productItem.title] = productItem.price * productItem.quantity;
              } else {
                  obj[productItem.title] += productItem.price * productItem.quantity;
              }
          })
      })

      let objAry = Object.keys(obj);
      let productAll = [];
      objAry.forEach(function (item) {
          let ary = [];
          ary.push(item);
          ary.push(obj[item]);
          productAll.push(ary);
      })

      // 排序 (多到少)
      productAll.sort(function (a, b) {
          return b[1] - a[1];
      });

      if (productAll.length > 3) {
          // 第三名之後的格式
          let otherTotal = 0;
          productAll.forEach(function (item, index) {
              if (index > 2) {
                  otherTotal += productAll[index][1];
              }
          })
          // 將 ary 放到 productTitle 陣列第 4 筆
          productAll.splice(3, productAll.length - 1);
          // 刪除 productTitle 陣列第 4 筆之後的資料
          productAll.push(['其他', otherTotal]);
          productAll.sort(function (a, b) {
            return b[1] - a[1];
        });
      }
      renderC3(productAll);
  }
}

// 全產品類別營收比重
function productCategoryRatio(orderData){
  if(orderData.length === 0){
    chart.innerHTML = `<div class="h4 text-main py-5">目前尚未有訂單</div>`;
  }else{
    let obj = {};
        let productCategory = [];
        orderData.forEach(function (item) {
            item.products.forEach(function (productItem) {
                if (obj[productItem.category] === undefined) {
                    obj[productItem.category] = productItem.quantity;
                } else {
                    obj[productItem.category] += productItem.quantity;
                }
            })

        })
        let objAry = Object.keys(obj);
        objAry.forEach(function (item) {
            let ary = [];
            ary.push(item);
            ary.push(obj[item]);
            productCategory.push(ary);
        })

        // 排序 (多到少)
        productCategory.sort(function (a, b) {
            return b[1] - a[1];
        });

        renderC3(productCategory);
    }
}

// C3.js 渲染
function renderC3(arrayType){
let orderChart = c3.generate({
  bindto: '#js-chart', 
  data: {
      type: "pie",
      columns: arrayType,
  },
      color: {
        pattern: ["#158564", "#20c997", "#3ce0af", "#b9f4e3"] //自訂調色盤顏色
      }
    });
  }
