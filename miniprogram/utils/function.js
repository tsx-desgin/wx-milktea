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

export {
  getConfig,
}