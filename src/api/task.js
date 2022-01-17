import request from '@/utils/request'

export async function taskVariable(params) {
  return request(`/bpm/task/variable`, {
    params
  })
}

export async function taskHistoric(params) {
  return request(`/bpm/task/historic`, {
    params
  })
}

export async function taskFileQuery(params) {
  return request(`/bpm/task/file`, {
    params
  })
}

export async function taskGoback(params) {
  return request(`/bpm/task/goback`, {
    method: 'POST',
    params
  })
}

export async function getDictType(dictType) {
  return request(`/sys-dict-entrys/dictType/${dictType}`, {
    method: 'GET'
  })
}

export async function getUnitCode(unitCode) {
  return request(`/business-lines/list/${unitCode}`, {
    method: 'GET'
  })
}

