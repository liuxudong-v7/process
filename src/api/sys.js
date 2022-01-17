import request from '@/utils/request'
import qs from 'qs'

// 用户管理：/sys-users
const userUrl = '/sys-users'
export function fetchUsersList(params) {
  return request({
    url: userUrl,
    method: 'get',
    params
  })
}
export function fetchDataPerms() {
  return request({
    url: `${userUrl}/fetchDataPerms`,
    method: 'get'
  })
}
export function usersList() {
  return request({
    url: `${userUrl}/list`,
    method: 'get'
  })
}
export function createUser(params) {
  return request({
    url: userUrl,
    method: 'post',
    data: params
  })
}
export function updateUser(id, params) {
  return request({
    url: `${userUrl}/${id}`,
    method: 'put', // post ?
    data: params
  })
}
export function deleteUser(id) {
  return request({
    url: `${userUrl}/${id}`,
    method: 'DELETE',
    data: ''
  })
}
export function resetPasswordById(id, params) {
  return request({
    url: `${userUrl}/${id}/passwdReset`,
    method: 'post',
    data: params
  })
}
export function updatePassword(params) {
  return request({
    url: `/sys-users/changePassword`,
    method: 'post',
    data: params
  })
}

// 租户审核人列表
export function getAuditorsList() {
  return request({
    url: `${userUrl}/auditors`,
    method: 'get'
  })
}

// sys-roles  角色获取
const roleUrl = '/sys-roles'
export function fetchRoleList(params) {
  return request({
    url: roleUrl,
    method: 'get',
    params
  })
}
export function fetchRoleListAll() {
  return request({
    url: `${roleUrl}/list`,
    method: 'get'
  })
}
export function roleList() {
  return request({
    url: `${roleUrl}/list`,
    method: 'get'
  })
}

export function createRole(params) {
  return request({
    url: roleUrl,
    method: 'post',
    data: params
  })
}
export function updateRole(id, params) {
  return request({
    url: `${roleUrl}/${id}`,
    method: 'put', // post ?
    data: params
  })
}
export function deleteRole(id) {
  return request({
    url: `${roleUrl}/${id}`,
    method: 'DELETE',
    data: ''
  })
}

// 用户角色
const userRolesUrl = '/sys-user-roles'
export function fetchUserRoleList(params) {
  return request({
    url: userRolesUrl, // SYS_USER_ROLE
    method: 'get',
    params
  })
}
export function createUseRole(params) {
  return request({
    url: userRolesUrl,
    method: 'post',
    data: params
  })
}
export function updaUserRole(id, params) {
  return request({
    url: `${userRolesUrl}/${id}`,
    method: 'put',
    data: params
  })
}
export function deleteUserRole(id) {
  return request({
    url: `${userRolesUrl}/${id}`,
    method: 'delete'
  })
}
export function getRoleIdsByUserid(userId) {
  return request({
    url: `${userRolesUrl}/getRoleIds/${userId}`,
    method: 'get'
  })
}
export function bindRole(userId, params) {
  return request({
    url: `${userRolesUrl}/${userId}/bind`,
    method: 'post',
    data: params
  })
}

// 租户
const tenantUrl = '/tenants'
export function fetchTenantList(params) {
  return request({
    url: tenantUrl,
    method: 'get',
    params
  })
}
export function fetchTenantListAll() {
  return request({
    url: `${tenantUrl}/list`,
    method: 'get'

  })
}
export function fetchTenantItem(id) {
  return request({
    url: `${tenantUrl}/${id}`,
    method: 'get'
  })
}

export function createTenant(params) {
  return request({
    url: tenantUrl,
    method: 'post',
    data: params
  })
}

export function updateTenant(id, params) {
  return request({
    url: `${tenantUrl}/${id}/update`,
    method: 'post',
    data: params
  })
}

export function deleteTenant(id, params) {
  return request({
    url: `${tenantUrl}/${id}/delete`,
    method: 'post',
    data: params
  })
}

export function getWorkOrderList(params) {
  return request({
    url: '/workOrder/order',
    method: 'get',
    params
  })
}

export function getworkOrderRecall(id, params) {
  return request({
    url: `/workOrder/${id}/recall`,
    method: 'post',
    data: params
  })
}
export function workOrderUndo(id, params) {
  return request({
    url: `/workOrder/${id}/undo`,
    method: 'post',
    data: params
  })
}

// 租户密码重置
export function passwdReset(id) {
  return request({
    url: `${tenantUrl}/${id}/passwdReset`,
    method: 'post',
    data: ''
  })
}
// 租户配置环境
export function fetchTabtenantList(params) {
  return request({
    url: 'tenantEnvs',
    method: 'get',
    params
  })
}
// 底座环境
export function fetchTabtenantListAll() {
  return request({
    url: 'tenantEnvs/list',
    method: 'get'
  })
}
export function findAllTenantEnv() {
  return request({
    url: 'tenantEnvs/list',
    method: 'get'
  })
}
//  审批阶段设置处理人接口
// POST : /api/tenants/{id}/auditor
export function tenantsExchange(id, params) {
  return request({
    url: `${tenantUrl}/${id}/auditor`,
    method: 'post',
    data: params
  })
}
// 处理人发表意见接口 POST : /api/tenants/{id}/advice
export function tenantsSolve(id, params) {
  return request({
    url: `${tenantUrl}/${id}/advice`,
    method: 'post',
    data: params
  })
}
export function tenantsEnvsExchange(id, params) {
  return request({
    url: `/tenantEnvs/${id}/auditor`,
    method: 'post',
    data: params
  })
}
// 处理人发表意见接口 POST : /api/tenantEnvs/{id}/advice
export function tenantsEnvsSolve(id, params) {
  return request({
    url: `/tenantEnvs/${id}/advice`,
    method: 'post',
    data: params
  })
}
export function fetchTabtenantItem(id) {
  return request({
    url: `/tenantEnvs/${id}`,
    method: 'get'
  })
}

export function createTabtenant(params) {
  return request({
    url: 'tenantEnvs',
    method: 'post',
    data: params
  })
}

export function updaTabtenant(id, params) {
  return request({
    url: `tenantEnvs/${id}/update`,
    method: 'post',
    data: params
  })
}
export function deleteTabtenant(id, params) {
  return request({
    url: `tenantEnvs/${id}/delete`,
    method: 'post',
    data: params
  })
}

// 主机信息接口
const hostUrl = '/hosts'
export function fetchHostList(params) {
  return request({
    url: hostUrl,
    method: 'get',
    params
  })
}
export function createHost(params) {
  return request({
    url: 'hosts',
    method: 'post',
    data: params
  })
}
export function updateHost(id, params) {
  return request({
    url: `hosts/${id}`,
    method: 'put',
    data: params
  })
}
export function deleteHost(id, params) {
  return request({
    url: `hosts/${id}`,
    method: 'delete',
    data: params
  })
}

// 租户配置环境主机注册
const tenantHostRegUrl = '/tab-tenant-host-regs'
export function fetchTenantHostRegList(params) {
  return request({
    url: tenantHostRegUrl,
    method: 'get',
    params
  })
}

// 租户审核
export function updateTenantApply(id, params) {
  return request({
    url: `/tenants/${id}/check`,
    method: 'POST',
    data: params
  })
}

export function updateHistory(id) {
  return request({
    url: `/tenants-historic/${id}`,
    method: 'get'
  })
}

// 租户环境审核
export function tenantEnvApply(id, params) {
  return request({
    url: `/tenantEnvs/${id}/check`,
    method: 'POST',
    data: params
  })
}

export function tenantEnvHistory(id) {
  return request({
    url: `/tenantEnvs-historic/${id}`,
    method: 'get'
  })
}

// 集群信息
export function getClusters() {
  return request({
    url: `/clusters/current`,
    method: 'get'
  })
}
export function fetchClusterListAll() {
  return request({
    url: `/clusters/list`,
    method: 'get'
  })
}

// 机构 sys-orgnos
const orgnoUrl = '/sys-orgnos'
export function fetchOrgnoList(params) {
  return request({
    url: orgnoUrl,
    method: 'get',
    params
  })
}

// 获取所有机构
const getOrgnos = '/getOrgnos'
export function getOrgnosList() {
  return request({
    url: getOrgnos,
    method: 'get'
  })
}
export function createOrgno(params) {
  return request({
    url: orgnoUrl,
    method: 'post',
    data: params
  })
}
export function updateOrgno(id, params) {
  return request({
    url: `${orgnoUrl}/${id}`,
    method: 'put',
    data: params
  })
}
export function deleteOrgno(id) {
  return request({
    url: `${orgnoUrl}/${id}`,
    method: 'delete'
  })
}

// 模板
export function addTemplate(params) {
  return request({
    url: '/templates',
    method: 'post',
    data: params
  })
}

export function queryTemplate(params) {
  return request({
    url: '/templates/all',
    method: 'get',
    params
  })
}
export function getTemplates(params) {
  return request({
    url: '/templates',
    method: 'get',
    params
  })
}

export function updateTemplate(id, params) {
  return request({
    url: `/templates/${id}`,
    method: 'put',
    data: params
  })
}

export function deleteTemplate(id) {
  return request({
    url: `/templates/${id}`,
    method: 'delete'
  })
}
// 渠道证书
const channelCertificateUrl = '/channelCertificate'
export function fetchChannelCertificateList(params) {
  return request({
    url: channelCertificateUrl,
    method: 'get',
    params
  })
}
export function fetchCertListAll() {
  return request({
    url: 'certificate/list',
    method: 'get'
  })
}
// const addChannelCertificateUrl = '/addChannelCertificate'
export function addChannelCertificate(params) {
  return request({
    url: channelCertificateUrl,
    method: 'post',
    data: params
  })
}

const uploadChannelCertificateUrl = '/uploadChannelCertificate'
export function uploadChannelCertificate(params) {
  return request({
    url: uploadChannelCertificateUrl,
    method: 'post',
    data: params
  })
}

export function channelCertificateFile(fd) {
  return request({
    url: `/channelCertificateFile`,
    method: 'post',
    data: fd
  })
}
export function deleteFlag(params) {
  return request({
    url: '/channelCertificate',
    method: 'put',
    data: params
  })
}

export function downloadFile(id) {
  return request({
    url: `/channelCertificateFile/${id}`,
    method: 'get'
  })
}
export function downLoadChannelCertificate(params) {
  return request({
    url: '/downLoadChannelCertificate?fileName=' + params,
    method: 'get'
  })
}
export function updateChannelCertificate(id) {
  return request({
    url: `/channelCertificate/${id}`,
    method: 'delete'
  })
}

export function getHid() {
  return request({
    url: '/hosts/list',
    method: 'get'
  })
}

// 底座管理
const osgiUpdateUrl = '/osgiUpdates'
export function fetchOsgiUpdateList(params) {
  return request({
    url: `${osgiUpdateUrl}`,
    method: 'get',
    params
  })
}
export function fetchOsgiListAll() {
  return request({
    url: `${osgiUpdateUrl}/list`,
    method: 'get'
  })
}
export function fetchOsgiUpdateItem(id) {
  return request({
    url: `${osgiUpdateUrl}/${id}`,
    method: 'get'
  })
}

export function createOsgiUpdate(params) {
  return request({
    url: osgiUpdateUrl,
    method: 'post',
    data: params
  })
}

export function updateOsgiUpdate(id, params) {
  return request({
    url: `${osgiUpdateUrl}/${id}/update`,
    method: 'post',
    data: params
  })
}
export function deleteOsgiUpdate(id, params) {
  return request({
    url: `${osgiUpdateUrl}/${id}/delete`,
    method: 'delete',
    data: params
  })
}
export function osgiUpdateHistory(id) {
  return request({
    url: `${osgiUpdateUrl}-historic/${id}`,
    method: 'get'
  })
}
// 底座审核
export function updateOsgiUpdateApply(id, params) {
  return request({
    url: `${osgiUpdateUrl}/${id}/check`,
    method: 'POST',
    data: params
  })
}
//  审批阶段设置处理人接口
// POST : /api/osgiUpdates/{id}/auditor
export function osgisExchange(id, params) {
  return request({
    url: `${osgiUpdateUrl}/${id}/auditor`,
    method: 'post',
    data: params
  })
}
// 处理人发表意见接口 POST : /api/osgiUpdates/{id}/advice
export function osgisSolve(id, params) {
  return request({
    url: `${osgiUpdateUrl}/${id}/advice`,
    method: 'post',
    data: params
  })
}
// osgiUpdates/{id}/buffer
export function getFileUpdate(id) {
  return request({
    url: `${osgiUpdateUrl}/${id}/buffer`,
    method: 'get'
  })
}
// 集群信息
const clusterUrl = 'clusters'
export function clusterList(params) {
  return request({
    url: clusterUrl,
    method: 'get',
    params
  })
}
export function findAllClusters() {
  return request({
    url: clusterUrl + '/list',
    method: 'get'
  })
}

export function updaCluster(id, params) {
  return request({
    url: `${clusterUrl}/${id}`,
    method: 'put',
    data: params
  })
}

export function createCluster(params) {
  return request({
    url: clusterUrl,
    method: 'post',
    data: params
  })
}

export function deleteFile(id) {
  return request({
    url: `channelCertificateFile/${id}`,
    method: 'delete'
  })
}

export function deleteCluster(id) {
  return request({
    url: `${clusterUrl}/${id}`,
    method: 'delete'
  })
}

// 权限管理
export function sysRolesPermsConfigList() {
  return request({
    url: 'sys-roles/perms-config',
    method: 'get'

  })
}
export function updaSysRolesId(id, params) {
  return request({
    url: `sys-roles/${id}/perms`,
    method: 'put',
    data: params

  })
}
export function sysRolesPermsById(id) {
  return request({
    url: `sys-roles/${id}/perms`,
    method: 'get'

  })
}

// 租户信息同步
export function tenantSyncsList(params) {
  return request({
    url: 'tenantSyncs/tenant',
    method: 'get',
    params
  })
}

export function syncsQuery(params) {
  return request({
    url: 'tenantSyncs',
    method: 'get',
    params
  })
}

export function tenantSynchro(params) {
  return request({
    url: `tenantSyncs/${params}/sync`,
    method: 'get'

  })
}

// 认证日志
export function fetchAuthLogsList(params) {
  return request({
    url: `/sys-auth-logss`,
    method: 'get',
    params,
    paramsSerializer: params => {
      return qs.stringify(params, { indices: false })
    }
  })
}

// 操作日志
export function fetchOperationLogsList(params) {
  return request({
    url: `/sys-operation-logss`,
    method: 'get',
    params,
    paramsSerializer: params => {
      return qs.stringify(params, { indices: false })
    }
  })
}

// 租户注册
export function navBarCreateTenant(params) {
  return request({
    url: `${tenantUrl}/register`,
    method: 'post',
    data: params
  })
}

// 我的待办记录数列表请求接口  GET /api/workbench-mydealt
export function getWorkbenchMydealt(params) {
  return request({
    url: 'workbench-mydealt',
    method: 'get',
    params
  })
}

// 部署区域
export function fetchDeployArea() {
  return request({
    url: '/deployArea/list',
    method: 'get'
  })
}

// "GET /api/netId/list" 查询网络标识集合
export function fetchNetId() {
  return request({
    url: '/netId/list',
    method: 'get'
  })
}

// "GET /api/tenants/list" 查询可用租户集合
export function fetchTenants() {
  return request({
    url: '/tenants/list',
    method: 'get'
  })
}

export function uploadOsgiFile(id, params) {
  return request({
    url: `/osgiFile/${id}`,
    method: 'put',
    data: params
  })
}

// osgiExport

export function osgiExports(params) {
  return request({
    url: 'osgiExport',
    method: 'post',
    data: params
  })
}

// "GET /api/material-exports",

export function fetchMaterialExports(params) {
  return request({
    url: '/material-exports',
    method: 'get',
    params
  })
}
// 定时任务接口
const scheduleTaskUrl = '/schedule-tasks'
export function fetchScheduleTaskList(params) {
  return request({
    url: scheduleTaskUrl,
    method: 'get',
    params
  })
}
export function createScheduleTask(params) {
  return request({
    url: scheduleTaskUrl,
    method: 'post',
    data: params
  })
}
export function updateScheduleTask(id, params) {
  return request({
    url: `${scheduleTaskUrl}/${id}`,
    method: 'put',
    data: params
  })
}
export function removeScheduleTask(id, params) {
  return request({
    url: `${scheduleTaskUrl}/${id}`,
    method: 'delete',
    data: params
  })
}

// 参数类型接口
const dictTypeUrl = '/sys-dict-types'
export function fetchDictTypeList(params) {
  return request({
    url: dictTypeUrl,
    method: 'get',
    params
  })
}
export function createDictType(params) {
  return request({
    url: dictTypeUrl,
    method: 'post',
    data: params
  })
}
export function updateDictType(id, params) {
  return request({
    url: `${dictTypeUrl}/${id}`,
    method: 'put',
    data: params
  })
}
export function deleteDictType(id, params) {
  return request({
    url: `${dictTypeUrl}/${id}`,
    method: 'delete',
    data: params
  })
}

// 字典条目接口
const dictEntryUrl = '/sys-dict-entrys'
export function fetchDictEntryList(params) {
  return request({
    url: dictEntryUrl,
    method: 'get',
    params
  })
}
export function getDictEntrys() {
  return request({
    url: `${dictEntryUrl}/list`,
    method: 'get'
  })
}
export function getDictEntrysTree() {
  return request({
    url: `${dictEntryUrl}/getTree`,
    method: 'get'
  })
}
export function getDictEntryByDictType(dictType) {
  return request({
    url: `${dictEntryUrl}/dictType/` + dictType,
    method: 'get'
  })
}
export function getDictEntryTreeByDictType(dictType) {
  return request({
    url: `${dictEntryUrl}/getTree/` + dictType,
    method: 'get'
  })
}
export function createDictEntry(params) {
  return request({
    url: dictEntryUrl,
    method: 'post',
    data: params
  })
}
export function saveDictEntry(params) {
  return request({
    url: `${dictEntryUrl}/batch`,
    method: 'post',
    data: params
  })
}
export function updateDictEntry(id, params) {
  return request({
    url: `${dictEntryUrl}/${id}`,
    method: 'put',
    data: params
  })
}
export function deleteDictEntry(id) {
  return request({
    url: `${dictEntryUrl}/${id}`,
    method: 'delete'
  })
}
