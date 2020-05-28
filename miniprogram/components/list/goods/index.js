// components/list/goods/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goods:Array,
    title:String,
  },

  /**
   * 组件的初始数据
   */
  data: {
    number:1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 触底刷新
    onscrolltolower(){
      // 向父级传送一个事件
      console.log('111')
      this.triggerEvent('loadMore')
    },
    editCart(e){
      this.triggerEvent('editCart',e.detail)
    }
  }
})
