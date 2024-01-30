import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

//vueRouter で必要なモジュールを読み込む
import { RouteRecordRaw,createWebHistory,createRouter } from 'vue-router';

//トップページとプレイページを読み込む
import TopPage from "./pages/TopPage.vue";
import PlayPage from "./pages/PlayPage.vue";

//各画面のルーティン情報を記述する
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "TopPage",
    component: TopPage,
  },
  {
    path: "/play",
    name: "PlayPage",
    component: PlayPage,
  },
];
//各画面のルーティン情報からルーターを作成する
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  });

createApp(App).use(router).mount('#app')
