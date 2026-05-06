import BaseService from './BaseService'

/**
 * Employee Service
 * Handles employee and HR management
 */
export default class EmployeeService extends BaseService {
  constructor() {
    super('')
  }

  /**
   * Get all employees
   * @param {Object} filters - { department_id, status, search, limit, page }
   */
  async getEmployees(filters = {}) {
    return this.get('/employees', { params: filters })
  }

  /**
   * Get employee details
   * @param {number} id - Employee ID
   */
  async getEmployeeDetails(id) {
    return this.get(`/employees/${id}`)
  }

  /**
   * Create new employee
   * @param {Object} data - { name, email, phone, position, department_id, salary }
   */
  async createEmployee(data) {
    return this.post('/employees', data)
  }

  /**
   * Update employee
   * @param {number} id - Employee ID
   * @param {Object} data - Updated employee data
   */
  async updateEmployee(id, data) {
    return this.put(`/employees/${id}`, data)
  }

  /**
   * Delete employee
   * @param {number} id - Employee ID
   */
  async deleteEmployee(id) {
    return this.delete(`/employees/${id}`)
  }

  /**
   * Update employee status
   * @param {number} id - Employee ID
   * @param {string} status - New status (active, inactive, on-leave, terminated)
   */
  async updateEmployeeStatus(id, status) {
    return this.put(`/employees/${id}/status`, { status })
  }

  /**
   * Get employee KPI data
   * @param {number} id - Employee ID
   */
  async getEmployeeKPI(id) {
    return this.get(`/employees/${id}/kpi`)
  }

  /**
   * Get employee performance
   * @param {number} id - Employee ID
   * @param {Object} filters - { from_date, to_date }
   */
  async getEmployeePerformance(id, filters = {}) {
    return this.get(`/employees/${id}/performance`, { params: filters })
  }

  /**
   * Get all departments
   */
  async getDepartments() {
    return this.get('/departments')
  }

  /**
   * Get department details
   * @param {number} id - Department ID
   */
  async getDepartmentDetails(id) {
    return this.get(`/departments/${id}`)
  }

  /**
   * Create department
   * @param {Object} data - { name, description }
   */
  async createDepartment(data) {
    return this.post('/departments', data)
  }

  /**
   * Update department
   * @param {number} id - Department ID
   * @param {Object} data - Updated department data
   */
  async updateDepartment(id, data) {
    return this.put(`/departments/${id}`, data)
  }

  /**
   * Delete department
   * @param {number} id - Department ID
   */
  async deleteDepartment(id) {
    return this.delete(`/departments/${id}`)
  }

  /**
   * Get employees by department
   * @param {number} id - Department ID
   */
  async getEmployeesByDepartment(id) {
    return this.get(`/departments/${id}/employees`)
  }

  /**
   * Get employee attendance
   * @param {number} id - Employee ID
   * @param {Object} filters - { from_date, to_date, limit, page }
   */
  async getEmployeeAttendance(id, filters = {}) {
    return this.get(`/${id}/attendance`, { params: filters })
  }

  /**
   * Record attendance check-in
   * @param {number} id - Employee ID
   */
  async checkIn(id) {
    return this.post(`/${id}/check-in`, {})
  }

  /**
   * Record attendance check-out
   * @param {number} id - Employee ID
   */
  async checkOut(id) {
    return this.post(`/${id}/check-out`, {})
  }

  /**
   * Get salary information
   * @param {number} id - Employee ID
   */
  async getSalaryInfo(id) {
    return this.get(`/${id}/salary`)
  }

  /**
   * Get leave applications
   * @param {Object} filters - { status, from_date, to_date }
   */
  async getLeaveApplications(filters = {}) {
    return this.get('/leave-applications', { params: filters })
  }

  /**
   * Apply for leave
   * @param {Object} data - { from_date, to_date, reason, type }
   */
  async applyForLeave(data) {
    return this.post('/leave-applications', data)
  }

  /**
   * Approve leave application
   * @param {number} id - Leave application ID
   */
  async approveLeave(id) {
    return this.post(`/leave-applications/${id}/approve`, {})
  }

  /**
   * Reject leave application
   * @param {number} id - Leave application ID
   * @param {string} reason - Rejection reason
   */
  async rejectLeave(id, reason = '') {
    return this.post(`/leave-applications/${id}/reject`, { reason })
  }
}
