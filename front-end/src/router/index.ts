import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    // path: '/',
    // name: 'chat',
    // component: () => import('../views/Chat.vue')
    path: "/",
    name: "talk",
    component: () => import("../views/Talk.vue"),
  },
  {
    // path: '/',
    // name: 'chat',
    // component: () => import('../views/Chat.vue')
    path: "/talk2",
    name: "talk2",
    component: () => import("../views/Talk2.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
