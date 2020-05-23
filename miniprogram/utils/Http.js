import {getConfig} from "./function"
const HttpConfig =getConfig('http');
class Http {
  static request ({url ,data ={} ,method ='get' ,header ={}}) {
    if(url===''){
      return
    }
    if(!Reflect.has(header,'appkey') && HttpConfig.apiKey){
      header.appkey = HttpConfig.apiKey;
    }
    url =HttpConfig.baseUrl +url
    return new Promise ((resolve,reject) =>{
      wx.request({
        url,
        data,
        method,
        header,
        success : res => {
          if(res.statusCode.toString().startsWith('2')){
            res = res.data;
            if(parseInt(res.error_code) === 0){
              resolve(res.data || '')
            }else{
              reject(res.error_msg)
            }
          }else{
            reject('请求失败')
          }
        },
        fail : err => {
          reject(err)
        }
      })
    })
  }
}

export {
  Http
}