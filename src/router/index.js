import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/loading',
    component: () => import('@/views/loading/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [{
      path: '/redirect/:path*',
      component: () => import('@/views/redirect/index')
    }]
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '主页', icon: 'el-icon-s-home' }
    }]
  }

  // {
  //   path: '/demo',
  //   component: Layout,
  //   name: 'Demo',
  //   meta: { title: 'Demo', icon: 'el-icon-s-help' },
  //   children: [
  //     {
  //       path: '/demo1',
  //       name: 'Demo1',
  //       component: () => import('@/views/table/demo'),
  //       meta: { title: 'Demo2', icon: 'user' }
  //     },
  //     {
  //       path: '/pdf',
  //       name: 'PDF',
  //       component: () => import('@/views/table/pdf'),
  //       meta: { title: 'PDF', icon: 'user' }
  //     },
  //     {
  //       path: '/pdfTo',
  //       name: 'PDFTo',
  //       component: () => import('@/views/table/pdfTo'),
  //       meta: { title: 'PDFTo', icon: 'user' }
  //     }
  //   ]
  // }

  // {
  //   path: '/tenant',
  //   component: Layout,
  //   redirect: '/tenant/base',
  //   name: 'Tenant',
  //   meta: { title: '租户管理', icon: 'el-icon-s-help' },
  //   children: [
  //     {
  //       path: '/base',
  //       name: 'Tenant',
  //       component: () => import('@/views/system/tenant/index'),
  //       meta: { title: '租户信息管理', icon: 'tenant' }
  //     }, {
  //       path: '/tenantenv',
  //       name: 'tenantEnv',
  //       component: () => import('@/views/system/tenantEnv/index'),
  //       meta: { title: '租户环境管理', icon: 'tenant' }
  //     }
  //     ]
  // },

  // {
  //   path: '/update',
  //   component: Layout,
  //   redirect: '/update/osgi',
  //   name: 'update',
  //   meta: { title: '升级管理', icon: 'el-icon-s-help' },
  //   children: [
  //     {
  //       path: '/osgi',
  //       name: 'Osgi',
  //       component: () => import('@/views/system/osgiUpdate/index'),
  //       meta: { title: '底座管理', icon: 'pedestal' }
  //     }, {
  //       path: '/certificate',
  //       name: 'Certificate',
  //       component: () => import('@/views/system/certificate/index'),
  //       meta: { title: '渠道证书管理', icon: 'tenantHostReg' }
  //     }, {
  //       path: '/cluster',
  //       name: 'Cluster',
  //       component: () => import('@/views/system/cluster/index'),
  //       meta: { title: '集群管理', icon: 'tenantHostReg' }
  //     }
  //   ]
  // },

  // {
  //   path: '/query',
  //   component: Layout,
  //   redirect: '/query/tenantSyncs',
  //   name: 'Query',
  //   meta: { title: '查询统计', icon: 'el-icon-s-help' },
  //   children: [
  //     {
  //       path: '/tenantSyncs',
  //       name: 'tenantSyncs',
  //       component: () => import('@/views/system/tenantSyncs/index'),
  //       meta: { title: '租户同步信息查看', icon: 'tenantHostReg' }
  //     }, {
  //       path: '/tenantHostReg',
  //       name: 'TenantHostReg',
  //       component: () => import('@/views/system/tenantHostReg/index'),
  //       meta: { title: '配置主机注册查询', icon: 'tenantHostReg' }
  //     }
  //   ]
  // },

  // {
  //   path: '/logs',
  //   component: Layout,
  //   redirect: '/logs/sysAuthLogs',
  //   name: 'Logs',
  //   meta: { title: '日志查看', icon: 'el-icon-s-help' },
  //   children: [
  //     {
  //       path: '/sysAuthLogs',
  //       name: 'SysAuthLogs',
  //       component: () => import('@/views/system/logs/authLogs/index'),
  //       meta: { title: '系统认证日志', icon: 'tenantHostReg' }
  //     }, {
  //       path: '/sysOperationLogs',
  //       name: 'sysOperationLogs',
  //       component: () => import('@/views/system/logs/operationLogs/index'),
  //       meta: { title: '系统操作日志', icon: 'tenantHostReg' }
  //     }
  //   ]
  // },

  // 404 page must be placed at the end !!!
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
