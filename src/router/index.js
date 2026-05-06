import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import LoginView from "../modules/auth/view/LoginView.vue";
import RegisterView from "../modules/auth/view/RegisterView.vue";
import HomeView from "../views/HomeView.vue";
import NotFoundView from "../views/errors/NotFoundView.vue";
import UnauthorizedView from "../views/errors/UnauthorizedView.vue";
import ServerErrorView from "../views/errors/ServerErrorView.vue";
import { canAccessPermission } from "@/config/permissions";

const routes = [
  {
    path: "/",
    redirect: () => {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        return "/login";
      }
      return authStore.user ? authStore.getDefaultRoute() : "/home";
    },
  },
  {
    path: "/home",
    name: "Home",
    component: HomeView,
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true },
  },

  // Operations Module
  {
    path: "/floor-plan",
    name: "FloorPlan",
    component: () => import("@/modules/operations/views/FloorPlanView.vue"),
    meta: { requiresAuth: true, permission: "tables" },
  },
  {
    path: "/tables",
    name: "Tables",
    component: () => import("@/modules/operations/views/TablesView.vue"),
    meta: { requiresAuth: true, permission: "tables" },
  },

  // Kitchen Module
  {
    path: "/kitchen",
    name: "Kitchen",
    component: () => import("@/modules/kitchen/views/KitchenDisplayView.vue"),
    meta: { requiresAuth: true, permission: "kitchen" },
  },
  {
    path: "/kitchen/queue",
    name: "KitchenQueue",
    component: () => import("@/modules/kitchen/views/QueueView.vue"),
    meta: { requiresAuth: true, permission: "kitchen" },
  },

  // Inventory Module
  {
    path: "/inventory",
    name: "Inventory",
    component: () => import("@/modules/inventory/views/InventoryView.vue"),
    meta: { requiresAuth: true, permission: "inventory" },
  },
  {
    path: "/menu-management",
    name: "MenuManagement",
    component: () => import("@/modules/inventory/views/MenuManagementView.vue"),
    meta: { requiresAuth: true, permission: "menu-management" },
  },

  // HR Module
  {
    path: "/employees",
    name: "Employees",
    component: () => import("@/modules/hr/views/EmployeesView.vue"),
    meta: { requiresAuth: true, permission: "employees" },
  },
  {
    path: "/departments",
    name: "Departments",
    component: () => import("@/modules/hr/views/DepartmentsView.vue"),
    meta: { requiresAuth: true, permission: "employees" },
  },

  // Analytics Module
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/modules/analytics/views/DashboardView.vue"),
    meta: { requiresAuth: true, permission: "dashboard" },
  },
  {
    path: "/reports",
    name: "Reports",
    component: () => import("@/modules/analytics/views/ReportsView.vue"),
    meta: { requiresAuth: true, permission: "reports" },
  },

  // Billing Module
  {
    path: "/payments",
    name: "Payments",
    component: () => import("@/modules/billing/views/PaymentsView.vue"),
    meta: { requiresAuth: true, permission: "payments" },
  },
  {
    path: "/invoices",
    name: "Invoices",
    component: () => import("@/modules/billing/views/InvoicesView.vue"),
    meta: { requiresAuth: true, permission: "invoices" },
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
    meta: { requiresAuth: true, permission: "settings" },
  },
  {
    path: "/change-password",
    name: "ChangePassword",
    component: () => import("@/modules/auth/view/ChangePasswordView.vue"),
    meta: { requiresAuth: true },
  },

  // Error Pages
  {
    path: "/error/404",
    name: "NotFound",
    component: NotFoundView,
  },
  {
    path: "/error/401",
    name: "Unauthorized",
    component: UnauthorizedView,
  },
  {
    path: "/error/403",
    name: "Forbidden",
    component: UnauthorizedView,
  },
  {
    path: "/error/500",
    name: "ServerError",
    component: ServerErrorView,
  },

  // Catch-all for 404
  {
    path: "/:pathMatch(.*)*",
    redirect: "/error/404",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.getCurrentUser();
    } catch (err) {
      await authStore.logout();
      if (to.meta.requiresAuth || to.path === "/") {
        return "/login";
      }
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return "/login";
  }

  if ((to.path === "/login" || to.path === "/register") && authStore.isAuthenticated) {
    return authStore.user ? authStore.getDefaultRoute() : false;
  }

  if (to.meta.requiresAuth && authStore.isAuthenticated && to.meta.role) {
    const userRole = authStore.user?.role;
    if (userRole === "admin") {
      return;
    }
    const allowedRoles = Array.isArray(to.meta.role) 
      ? to.meta.role 
      : [to.meta.role];

    if (!allowedRoles.includes(userRole)) {
      return "/error/403";
    }
  }

  if (to.meta.requiresAuth && authStore.isAuthenticated && to.meta.permission) {
    if (!canAccessPermission(authStore.user?.role, to.meta.permission)) {
      return "/error/403";
    }
  }
});

export default router;
