class User {
  static async getDetail() {
    let user = await wx.cloud.callFunction({
      name:'user',
      data:{
        $url:'detail'
      }
    }).then(res => res.result)
    // console.log(user)
    if(!user.nickname){
     return new Promise((resolve,reject) =>{
      wx.getUserInfo({
        success: (res) => {
          console.log(res)
          if(res.userInfo){
            // user = {...user,...res.userInfo}
            user = Object.assign(res.userInfo,user)
            console.log(user)
            resolve(user)
          }
        },
      })
     })
    }
    return user
  }
  static async update(userId,data){
    return await wx.cloud.callFunction({
      name:'user',
      data:{
        $url:'update',
        user:data,
        userId:userId
      }
    }).then(res => res.result)
  }
}

export {
  User
}