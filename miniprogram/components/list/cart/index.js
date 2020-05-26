
// components/list/cart/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cart:Array,
  },
  // 监听cart的变化
  observers:{
    cart(val){
      console.log('1',val)
      let total = 0;
      val.forEach(item => {
        total += item.goodsPrice * item.buyNumber
      });
      this.setData({
        cartTotal:total
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    cartTotal:0,
    showList:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showCartList(){
      this.setData({
        showList:!this.data.showList
      })
    }
  }
})
