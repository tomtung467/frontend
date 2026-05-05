import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import LoginView from "../modules/auth/view/LoginView.vue";
import RegisterView from "../modules/auth/view/RegisterView.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
    meta: { requiresAuth: false },
  },

  // Customer Module
  {
    path: "/menu",
    name: "Menu",
    component: () => import("@/modules/customer/views/MenuView.vue"),
    meta: { requiresAuth: true, role: "customer" },
  },
  {
    path: "/cart",
    name: "Cart",
    component: () => import("@/modules/customer/views/CartView.vue"),
    meta: { requiresAuth: true, role: "customer" },
  },
  {
    path: "/orders",
    name: "Orders",
    component: () => import("@/modules/customer/views/OrdersView.vue"),
    meta: { requiresAuth: true, role: "customer" },
  },

  // Operations Module
  {
    path: "/floor-plan",
    name: "FloorPlan",
    component: () => import("@/modules/operations/views/FloorPlanView.vue"),
    meta: { requiresAuth: true, role: ["staff", "manager"] },
  },
  {
    path: "/tables",
    name: "Tables",
    component: () => import("@/modules/operations/views/TablesView.vue"),
    meta: { requiresAuth: true, role: ["staff", "manager"] },
  },

  // Kitchen Module
  {
    path: "/kitchen",
    name: "Kitchen",
    component: () => import("@/modules/kitchen/views/KitchenDisplayView.vue"),
    meta: { requiresAuth: true, role: "chef" },
  },
  {
    path: "/kitchen/queue",
    name: "KitchenQueue",
    component: () => import("@/modules/kitchen/views/QueueView.vue"),
    meta: { requiresAuth: true, role: "chef" },
  },

  // Inventory Module
  {
    path: "/inventory",
    name: "Inventory",
    component: () => import("@/modules/inventory/views/InventoryView.vue"),
    meta: { requiresAuth: true, role: ["manager", "chef"] },
  },
  {
    path: "/menu-management",
    name: "MenuManagement",
    component: () => import("@/modules/inventory/views/MenuManagementView.vue"),
    meta: { requiresAuth: true, role: "manager" },
  },

  // HR Module
  {
    path: "/employees",
    name: "Employees",
    component: () => import("@/modules/hr/views/EmployeesView.vue"),
    meta: { requiresAuth: true, role: "manager" },
  },
  {
    path: "/departments",
    name: "Departments",
    component: () => import("@/modules/hr/views/DepartmentsView.vue"),
    meta: { requiresAuth: true, role: "manager" },
  },

  // Analytics Module
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/modules/analytics/views/DashboardView.vue"),
    meta: { requiresAuth: true, role: ["manager", "admin"] },
  },
  {
    path: "/reports",
    name: "Reports",
    component: () => import("@/modules/analytics/views/ReportsView.vue"),
    meta: { requiresAuth: true, role: ["manager", "admin"] },
  },

  // Billing Module
  {
    path: "/payments",
    name: "Payments",
    component: () => import("@/modules/billing/views/PaymentsView.vue"),
    meta: { requiresAuth: true, role: ["staff", "manager"] },
  },
  {
    path: "/invoices",
    name: "Invoices",
    component: () => import("@/modules/billing/views/InvoicesView.vue"),
    meta: { requiresAuth: true, role: ["staff", "manager"] },
  },

  // User Settings Module
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/modules/auth/view/ProfileView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/modules/auth/view/SettingsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/change-password",
    name: "ChangePassword",
    component: () => import("@/modules/auth/view/ChangePasswordView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if ((to.path === "/login" || to.path === "/register") && authStore.isAuthenticated) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;