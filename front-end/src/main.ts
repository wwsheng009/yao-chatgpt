import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// import Antd from "ant-design-vue";

import "ant-design-vue/dist/antd.css";
import "./assets/style.css";
import { setupComponents } from "./plugin";

const app = createApp(App);
app.use(router);
setupComponents(app);
app.mount("#app");
// createApp(App).use(router).use(Antd).mount("#app");
