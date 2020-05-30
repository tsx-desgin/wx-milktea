export default{
  name(val){
      if(val===''){
          return {error:1,message:'收货人为空'}
      }
      return {error:0}
  },
   phone(val){
      if(val===''){
          return {error:1,message:'手机号码为空'}
      }
      if(!/^1[3-9]\d{9}$/.test(val)){
          return {error:1,message:'手机号码格式不正确'}
      }
      return {error:0}
  },
   region(val){
       console.log(val)
      if(val.length===0){
          return {error:1,message:'请选择地区'}
      }
      if(val[0]===''|| val[0]==='全部'){
          if(val[0]==='全部'){
            return {error:1,message:'不能选全部(省)'}
          }
      }
      if(val[1]===''|| val[1]==='全部'){
        if(val[1]==='全部'){
            return {error:1,message:'不能选全部(市)'}
        }
        return {error:1,message:'请选择市'}
      }
      if(val[2]===''|| val[2]==='全部'){
        if(val[2]==='全部'){
            return {error:1,message:'不能选全部(区)'}
        }
        return {error:1,message:'请选择区'}
      }
      return {error:0}
  },
  detail(val){
      console.log('11',val)
      if(val===''){
          return {error:1,message:'详细地址为空'}
      }
      return {error:0}
  }
}