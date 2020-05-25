// components/list/category/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    categoryList:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    catId:-1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeCategory(e){
      const catId = parseInt(e.currentTarget.dataset.catId);
      this.setData({
        catId
      })
      // 将事件传到父组件
      this.triggerEvent('change',{catId})
    }
  }
})
