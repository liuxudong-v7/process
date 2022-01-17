import Layout from '@/layout'

export const asyncRoutes = [
  {
    path: '/sys',
    component: Layout,
    redirect: '/sys/user',
    name: 'Sys',
    meta: { title: '系统管理', icon: 'el-icon-setting' },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/sys/user/index'),
        meta: { title: '用户信息管理', icon: 'user' }
      }, {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/system/sys/role/index'),
        meta: { title: '角色信息管理', icon: 'role' }
      },
      /* {
        path: 'userRole',
        name: 'UserRole',
        component: () => import('@/views/system/sys/userRole/index'),
        meta: { title: '用户角色管理', icon: 'el-icon-connection' }
      }, {
        path: 'orgnos',
        name: 'Orgnos',
        component: () => import('@/views/system/sys/orgnos/index'),
        meta: { title: '机构信息管理', icon: 'el-icon-office-building' } // tenantHostReg
      },*/ {
        path: 'parameter',
        name: 'Parameter',
        component: () => import('@/views/system/sys/parameter/index'),
        meta: { title: '字典参数管理', icon: 'el-icon-receiving' }
      }, {
        path: 'template',
        name: 'Template',
        component: () => import('@/views/system/sys/template/index'),
        meta: { title: '物理系统模板', icon: 'el-icon-s-order' }
      }
      // {
      //   path: 'scheduleTask',
      //   name: 'ScheduleTask',
      //   component: () => import('@/views/system/sys/scheduleTask/index'),
      //   meta: { title: '定时任务管理', icon: 'el-icon-alarm-clock' }
      // }
    ]
  },

  {
    path: '/channel',
    component: Layout,
    redirect: '/channel/tenants',
    name: 'Channel',
    meta: { title: '渠道管理', icon: 'el-icon-user' },
    children: [
      {
        path: 'tenantEnv',
        name: 'TenantEnv',
        component: () => import('@/views/system/channel/tenantEnv/index'),
        meta: { title: '物理子系统流程', icon: 'el-icon-eleme' }
      }, {
        path: 'clusters',
        name: 'Clusters',
        component: () => import('@/views/system/channel/cluster/index'),
        meta: { title: '集群管理', icon: 'el-icon-s-grid' }
      }, {
        path: 'osgi',
        name: 'Osgi',
        component: () => import('@/views/system/channel/osgiUpdate/index'),
        meta: { title: '底座流程', icon: 'el-icon-s-operation' }
      }, {
        path: 'tenants',
        name: 'Tenants',
        component: () => import('@/views/system/channel/tenant/index'),
        meta: { title: '租户流程', icon: 'el-icon-s-custom' }
      }, {
        path: 'hosts',
        name: 'Hosts',
        component: () => import('@/views/system/channel/host/index'),
        meta: { title: '主机管理', icon: 'el-icon-monitor' }
      }, {
        path: 'certificate',
        name: 'Certificate',
        component: () => import('@/views/system/channel/certificate/index'),
        meta: { title: '证书管理', icon: 'el-icon-s-ticket' }
      }, {
        path: 'osgiExport',
        name: 'osgiExport',
        component: () => import('@/views/system/channel/osgiExport/index'),
        meta: { title: '物料导出', icon: 'el-icon-printer' }
      }
    ]
  },

  {
    path: '/logs',
    component: Layout,
    redirect: '/logs/sysAuthLogs',
    name: 'Logs',
    meta: { title: '日志查看', icon: 'el-icon-tickets' },
    children: [
      {
        path: 'sysAuthLogs',
        name: 'SysAuthLogs',
        component: () => import('@/views/system/logs/authLogs/index'),
        meta: { title: '系统认证日志', icon: 'el-icon-notebook-1' }
      }, {
        path: 'sysOperationLogs',
        name: 'SysOperationLogs',
        component: () => import('@/views/system/logs/operationLogs/index'),
        meta: { title: '系统操作日志', icon: 'el-icon-notebook-2' }
      }
    ]
  }

]
