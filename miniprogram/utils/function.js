// getConfig('navigate.a')
const getConfig = function (name) {
  const distIndex =name.indexOf('.');
  let filename ='',configName ='';
  if(distIndex >-1){
    filename =name.slice(0,distIndex);
    configName =name.substr(distIndex+1);
  }else{
    filename=name;
  }
  try {
    const config =require('../config/'+filename).default;
    if(config){
      return configName != '' ?config[configName] :config;
    }else{
      return null;
    }
  } catch (error) {
      console.log('config',error);
      return null
  }
}
function dateFormat(fmt,date){
  let ret;
  var opt = {
      "Y+": date.getFullYear().toString(),                 //年份
      "M+": (date.getMonth()+1) .toString(),                  //月份
      "d+": date.getDate().toString(),                   //日
      "h+": date.getHours().toString(),                   //小时
      "m+": date.getMinutes().toString(),                  //分
      "s+": date.getSeconds().toString(),                  //秒
  };
  for(let k in opt){
      ret=new RegExp("("+k+")").exec(fmt);
      if(ret){
          fmt=fmt.replace(ret[1],(ret[1].length===1)?(opt[k]):(opt[k].padStart(ret[1].length,0)))
      }
  }
  return fmt;
}
function getRandom (){
  let res = ['1','2','3','4','5','6','7','8','9','0','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
  let len = ''
  for(let i =0 ;i<12;i++){
    len+=res[parseInt(Math.random()*res.length)]
  }
  return len
}
const isObject = obj=>{
  return typeof obj ==='object' && obj!=null
}
const isEmpty = obj =>{
  if(!isObject(obj)){
    return !obj
  }
  return Object.keys(obj).length ===0
}
const validate =function(data,validateObj){
  for(let key in data){
      if(Reflect.has(validateObj,key)){
          const res=validateObj[key](data[key],data.password);
          console.log(res);
          if(res.error!=0){
              return res;
          }
      }
  }
  return {error:0}
}

export {
  getConfig,
  isObject,
  isEmpty,
  validate,
  dateFormat,
  getRandom
}