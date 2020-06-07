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
            user = Object.assign(user,res.userInfo)
            console.log(user)
            resolve(user)
          }
        },
      })
     })
    }
    return user
  }
}

export {
  User
}