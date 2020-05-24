import {
  Storage
} from '../utils/Storage'
import {
  getConfig
} from '../utils/function'
const categoryKey = getConfig('storage.category') || 'category'
class Category extends Storage {
  constructor(){
    super(categoryKey, true)
  }
}

export {
  Category
}