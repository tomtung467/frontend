import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style.css";

// Import Vuetify
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

// Import Lucide icons
import * as LucideVue from 'lucide-vue-next';

// Create Vuetify instance with MDI icons
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
  },
});

const app = createApp(App);

// Register all Lucide icons globally
for (const [key, component] of Object.entries(LucideVue)) {
  app.component(key, component);
}

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.mount("#app");
