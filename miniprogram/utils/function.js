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
  validate
}