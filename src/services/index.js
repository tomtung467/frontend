/**
 * Service Index
 * Exports all services for easy access throughout the application
 */

import AuthService from './authService'
import MenuService from './menuService'
import OrderService from './orderService'
import KitchenService from './kitchenService'
import InventoryService from './inventoryService'
import TableService from './tableService'
import EmployeeService from './employeeService'
import PaymentService from './paymentService'
import AnalyticsService from './analyticsService'
import UserService from './userService'

// Create singleton instances
const authService = new AuthService()
const menuService = new MenuService()
const orderService = new OrderService()
const kitchenService = new KitchenService()
const inventoryService = new InventoryService()
const tableService = new TableService()
const employeeService = new EmployeeService()
const paymentService = new PaymentService()
const analyticsService = new AnalyticsService()
const userService = new UserService()

// Export services
export {
  authService,
  menuService,
  orderService,
  kitchenService,
  inventoryService,
  tableService,
  employeeService,
  paymentService,
  analyticsService,
  userService,
}

// Export classes for custom usage if needed
export {
  AuthService,
  MenuService,
  OrderService,
  KitchenService,
  InventoryService,
  TableService,
  EmployeeService,
  PaymentService,
  AnalyticsService,
  UserService,
}

// Default export as an object with all services
export default {
  authService,
  menuService,
  orderService,
  kitchenService,
  inventoryService,
  tableService,
  employeeService,
  paymentService,
  analyticsService,
  userService,
}
