import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from "element-plus/dist/locale/zh-cn.mjs"; // 引入中文语言包
import App from "./App.vue";
import router from "./router";
// import "amfe-flexible";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ElementPlus, {
  locale: zhCn // 设置语言为中文
});

app.mount("#app");
