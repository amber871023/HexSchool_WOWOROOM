//千分位
function toThousands(num) {
  let parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

//驗證姓名-只能輸入中文或只能輸入英文
function validateName(name){ 
  if(/^[\u4e00-\u9fa5]+$|^[a-zA-Z\s]+$/.test(name)){
    return true
  }
  return false;
}

//驗證手機
function validatePhone(phone) {
  if (/^[09]{2}\d{8}$/.test(phone)) {
    return true
  }
  return false;
}

//驗證信箱
function validateEmail(mail) {
  if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
    return true
  }
  return false;
}

