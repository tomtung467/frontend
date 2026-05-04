import api from './index'

export const employeeAPI = {
  getEmployees(params = {}) {
    return api.get('/employees', { params })
  },

  getEmployeeDetails(employeeId) {
    return api.get(`/employees/${employeeId}`)
  },

  createEmployee(data) {
    return api.post('/employees', data)
  },

  updateEmployee(employeeId, data) {
    return api.put(`/employees/${employeeId}`, data)
  },

  getKPIData(employeeId) {
    return api.get(`/employees/${employeeId}/kpi`)
  },

  updateEmployeeStatus(employeeId, status) {
    return api.get(`/employees/${employeeId}/status`, { status })
  },

  getDepartments() {
    return api.get('/departments')
  },

  getEmployeesByDepartment(departmentId) {
    return api.get(`/departments/${departmentId}/employees`)
  },
}
