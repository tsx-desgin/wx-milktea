// components/list/address/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    address:Object
  },
  //接受外界传来的class样式
  // externalClasses:['a','b'],
  // 设置样式隔离
  // isolated 表示启用样式隔离，在自定义组件内外，使用 class 指定的样式将不会相互影响（一般情况下的默认值）；
// apply-shared 表示页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面；
// shared 表示页面 wxss 样式将影响到自定义组件，自定义组件 wxss 中指定的样式也会影响页面和其他设置了 
// apply-shared 或 shared 的自定义组件。（这个选项在插件中不可用。）
  // options: {
  //   styleIsolation: 'apply-shared'
  // },
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    chooseAddress(){
      // 跳转页面
      // 可回跳
      wx.navigateTo({
        url: "/pages/address/address?from=list",
      })
      // 不可回跳
      // wx.redirectTo({
      //   url: "/pages/address/address?from=list",
      // })
    }
  }
})
