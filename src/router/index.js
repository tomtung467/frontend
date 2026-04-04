import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../modules/auth/view/LoginView.vue";
import RegisterView from "../modules/auth/view/RegisterView.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: {
      template: "<h1>Dashboard</h1>",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;