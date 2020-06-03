import {
  isObject,
  isEmpty,
  getConfig
} from '../utils/function'
const ADDRESS_STORE_NAME = getConfig('storage.selectAddress')
class Address {
  static async add(address) {
    if(!isObject(address) || isEmpty(address)){
      return {success:0,message:'参数错误'}
    }
    const res = await wx.cloud.callFunction({
      name:'address',
      data:{
        $url:'add',
        address
      }
    }).then(res =>res.result)
    console.log(res)
    return res
  }
  static async update(address,id) {
    if(!isObject(address) || isEmpty(address)||!id){
      return {success:0,message:'参数错误'}
    }
    const res = await wx.cloud.callFunction({
      name:'address',
      data:{
        $url:'update',
        address,
        id,
      }
    }).then(res =>res.result)
    return res
  }
  static async getAddress(){
    return await wx.cloud.callFunction({
      name:'address',
      data:{
        $url:'list'
      }
    }).then(res => res.result)
  }
  static async deleteAddress(id){
    if(!id){
      return {success:0,message:'参数错误'}
    }
    try {
      return await wx.cloud.callFunction({
        name:'address',
        data:{
          $url:'delete',
          id,
        }
      }).then(res =>res.result)
    } catch (error) {
      return {success:0,message:'删除失败'} 
    }
  }
  static async getDefaultAddressOrSelect() {
    const storageAddress = wx.getStorageSync(ADDRESS_STORE_NAME);
    if(storageAddress){
      return storageAddress
    }
    try {
      return await wx.cloud.callFunction({
        name:'address',
        data:{
          $url:'default',
        }
      }).then(res =>res.result)
    } catch (error) {
      return {}
    }
  }
  static async getAddressById(id){
    try {
      const res = await wx.cloud.callFunction({
        name:'address',
        data:{
          $url:'one',
          id,
        }
      }).then(res =>res.result)
      // console.log('11',res)
      if(res.success!==1){
        return {}
      }else{
        return res.data
      }
    } catch (error) {
      return {}
    }
  }
}

export {
  Address
}