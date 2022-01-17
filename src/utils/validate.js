/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
 export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

//是否手机号码或者固话
export function validatePhoneTwo(rule, value, callback) {
  const reg = /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/;
  if(value ==''|| value == undefined || value ==null) {
    callback();
  } else {
    if((!reg.test(value)) && value !='') {
      callback(new Error('请输入正确的电话号码或者固话号码'));
    } else {
      callback();
    }
  }
}

//是否固话
export function validateTelphone(rule, value, callback) {
  const reg =/0\d{2,3}-\d{7,8}/;
  if(value==''||value==undefined||value==null){
    callback();
  }else {
    if((!reg.test(value)) && value !='') {
      callback(newError('请输入正确的固定电话)'));
    } else {
      callback();
    }
  }
}

//是否手机号码
export function validatePhone(rule, value,callback) {
  const reg =/^[1][3-9][0-9]{9}$/;
  if(value==''||value==undefined||value==null){
    callback();
  }else {
    if((!reg.test(value)) && value !='') {
      callback(new Error('请输入正确的电话号码'));
    } else {
      callback();
    }
  }
}

//是否身份证号码
export function validateIdNo(rule, value,callback) {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  if(value==''||value==undefined||value==null){
    callback();
  }else {
    if((!reg.test(value)) && value !='') {
      callback(new Error('请输入正确的身份证号码'));
    } else {
      callback();
    }
  }
}

//账号校验
export const validateAccountNo = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入账号'))
  }
  if (!/^(?![0-9]*$)(?![a-zA-Z]*$)[a-zA-Z0-9]{6,20}$/.test(value)) {
    callback(new Error('账号必须为6-20位字母和数字组合'))
  } else {
    callback()
  }
};

//纯数字校验
export const isNumber = (rule, value, callback) => {
  let numberReg = /^\d $|^\d [.]?\d $/
  if (value !== '') {
      if (!numberReg.test(value)) {
          callback(new Error('请输入数字'))
      } else {
          callback()
      }
  } else {
      callback(new Error('请输入值'))
  }
};

//验证是否整数
export function isInteger(rule, value, callback) {
  if (!value) {
    return callback(new Error('输入不可以为空'));
  }
  setTimeout(() => {
    if (!Number(value)) {
      callback(new Error('请输入正整数'));
    } else {
      const re = /^[0-9]*[1-9][0-9]*$/;
      const rsCheck = re.test(value);
      if (!rsCheck) {
        callback(new Error('请输入正整数'));
      } else {
        callback();
      }
    }
  }, 0);
}

//验证是否整数,非必填
export function isIntegerNotMust(rule, value, callback) {
  if (!value) {
    callback();
  }
  setTimeout(() => {
    if (!Number(value)) {
      callback(new Error('请输入正整数'));
    } else {
      const re = /^[0-9]*[1-9][0-9]*$/;
      const rsCheck = re.test(value);
      if (!rsCheck) {
        callback(new Error('请输入正整数'));
      } else {
        callback();
      }
    }
  }, 1000);
}

//验证是否是[0-1]的小数
export function isDecimal(rule, value, callback) {
  if (!value) {
    return callback(new Error('输入不可以为空'));
  }
  setTimeout(() => {
    if (!Number(value)) {
      callback(new Error('请输入[0,1]之间的数字'));
    } else {
      if (value < 0 || value > 1) {
        callback(new Error('请输入[0,1]之间的数字'));
      } else {
        callback();
      }
    }
  }, 100);
}

//两位小数验证
export function isTowDecimal(rule, value, callback) {
  if (!/(^[1-9]([0-9] )?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/.test(value)) {
    callback(new Error('最多两位小数！！！'));
  } else {
    callback();
  }
}

//验证是否是[1-100]的小数,即不可以等于
export function isBtnOneToHundred(rule, value, callback) {
  if (!value) {
    return callback(new Error('输入不可以为空'));
  }
  setTimeout(() => {
    if (!Number(value)) {
      callback(new Error('请输入整数，值为[1,100]'));
    } else {
      if (value < 1 || value > 100) {
        callback(new Error('请输入整数，值为[1,100]'));
      } else {
        callback();
      }
    }
  }, 100);
}

//验证是否是[0-100]的小数
export function isBtnZeroToHundred(rule, value, callback) {
  if (!value) {
    return callback(new Error('输入不可以为空'));
  }
  setTimeout(() => {
    if (!Number(value)) {
      callback(new Error('请输入[1,100]之间的数字'));
    } else {
      if (value < 0 || value > 100) {
        callback(new Error('请输入[1,100]之间的数字'));
      } else {
        callback();
      }
    }
  }, 100);
}

//验证端口是否在[0,65535]之间
export function isPort(rule, value, callback) {
  if (!value) {
    return callback(new Error('输入不可以为空'));
  }
  setTimeout(() => {
    if (value == '' || typeof(value) == undefined) {
      callback(new Error('请输入端口值'));
    } else {
      const re = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
      const rsCheck = re.test(value);
      if (!rsCheck) {
        callback(new Error('请输入在[0-65535]之间的端口值'));
      } else {
        callback();
      }
    }
  }, 100);
}

//验证端口是否在[0,65535]之间，非必填,isMust表示是否必填
export function isCheckPort(rule, value, callback) {
  if (!value) {
    callback();
  }
  setTimeout(() => {
    if (value == '' || typeof(value) == undefined) {
      // callback(new Error('请输入端口值'));
    } else {
      const reg = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
      const rsCheck = reg.test(value);
      if (!rsCheck) {
        callback(new Error('请输入在[0-65535]之间的端口值'));
      } else {
        callback();
      }
    }
  }, 100);
}

/**
 * 是否合法IP地址
 * @param {string} value
 */
export function isIP(rule, value,callback) {
  if(value==''||value==undefined||value==null){
    callback();
  }else {
    const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    if ((!reg.test(value)) && value != '') {
      callback(new Error('请输入正确的IP地址'));
    } else {
      callback();
    }
  }
}

//是否邮箱
export function isEMail(rule, value,callback) {
  const reg =/^([a-zA-Z0-9]+[-_\.]?)+@[a-zA-Z0-9]+\.[a-z]+$/;
  if(value==''||value==undefined||value==null){
    callback();
  }else{
    if(!reg.test(value)){
      callback(new Error('请输入正确的邮箱'));
    } else {
      callback();
    }
  }
}

//合法url
export function isURL(url) {
  const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return urlregex.test(url);
}

//验证内容是否包含英文数字以及下划线
export function isPassword(rule, value, callback) {
  const reg =/^[_a-zA-Z0-9] $/;
  if(value==''||value==undefined||value==null){
    callback();
  } else {
    if (!reg.test(value)){
      callback(new Error('仅由英文字母，数字以及下划线组成'));
    } else {
      callback();
    }
  }
}

//小写字母
export function isLowerCase(val, callback) {
  if (!value) {
    callback();
  }
  setTimeout(() => {
    if (value == '' || typeof(value) == undefined) {
      // callback(new Error('请输入小写字母'));
    } else {
      const reg = /^[a-z] $/;
      const rsCheck = reg.test(value);
      if (!rsCheck) {
        callback(new Error('请输入小写字母'));
      } else {
        callback();
      }
    }
  }, 100);
}

//是否大写字母
export function isUpperCase(val, callback) {
  if (!value) {
    callback();
  }
  setTimeout(() => {
    if (value == '' || typeof(value) == undefined) {
      // callback(new Error('请输入大写字母'));
    } else {
      const reg = /^[A-Z] $/;
      const rsCheck = reg.test(value);
      if (!rsCheck) {
        callback(new Error('请输入大写字母'));
      } else {
        callback();
      }
    }
  }, 100);
}

//是否大小写字母
export function isAlphabets(val, callback) {
  if (!value) {
    callback();
  }
  setTimeout(() => {
    if (value == '' || typeof(value) == undefined) {
      // callback(new Error('请输入大小写字母'));
    } else {
      const reg = /^[A-Za-z] $/;
      const rsCheck = reg.test(value);
      if (!rsCheck) {
        callback(new Error('请输入大小写字母'));
      } else {
        callback();
      }
    }
  }, 100);
}


//中文校验
export const isInChinese = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入中文'))
  }
  if (!/^[\u0391-\uFFE5A-Za-z] $/.test(value)) {
    callback(new Error('不可输入特殊字符'))
  } else {
    callback()
  }
};
