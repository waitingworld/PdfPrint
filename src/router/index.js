import Vue from 'vue'
import Router from 'vue-router'
import PdfPrint from '@/components/PdfPrint'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'PdfPrint',
      component: PdfPrint
    }
  ]
})
