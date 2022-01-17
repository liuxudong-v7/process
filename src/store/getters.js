const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  level: state => state.user.level,
  agentId: state => state.user.agentId,
  rsrcList: state => state.user.rsrcList,
  perms: state => state.user.perms,
  permission_routes: state => state.permission.routes
}
export default getters
