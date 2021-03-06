<template>
  <div class="sidebar-container">
    <div class="sidebar-title-container">
      <site-brand class="site-brand" />
    </div>
    <nav>
      <template v-for="(item, index) in setting('site.nav')">
        <factor-link
          :key="index"
          :path="item.path"
          class="nav-link"
          :class="[item.target, { 'nav-link-active': selected === item.path }]"
          @click="sidebarPath(item.path)"
        >
          <span>{{ item.name }}</span>
        </factor-link>
      </template>
    </nav>

    <div v-formatted-text="setting('site.copyright') + currentyear()" class="copyright" />
  </div>
</template>

<script lang="ts">
import { factorLink } from "@factor/ui"
import { setting } from "@factor/api/settings"
import Vue from "vue"
export default Vue.extend({
  components: {
    factorLink,
    "site-brand": () => import("./el/brand.vue")
  },
  data() {
    return {
      loading: true,
      options: setting("site.nav"),
      selected: ""
    }
  },
  mounted: function() {
    for (const ele of this.options) {
      const observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            this.selected = `#${entries[0].target.id}`
          }
        },
        { threshold: [0.2] }
      )
      if (document.querySelector(ele.path)) {
        observer.observe(document.querySelector(ele.path))
      }
    }
  },
  methods: {
    setting,
    sidebarPath(this: any, path: any) {
      const ele = document.querySelector(path)
      if (ele) {
        ele.scrollIntoView()
      }
    },
    currentyear(this: any) {
      return new Date().getFullYear()
    }
  }
})
</script>

<style lang="less" scoped>
.sidebar-container {
  position: fixed;
  font-family: var(--font-family-primary);
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  color: #f7f7f7;
  background: linear-gradient(90deg, #732b29 -100%, #101010 100%);
  background-color: #351a19;
  min-height: 100vh;
  height: auto;
  width: 280px;

  &.show-desktop {
    display: grid;
    @media (max-width: 900px) {
      display: none;
    }
  }

  @media (max-width: 900px) {
    position: relative;
    z-index: 10;
  }

  > div:last-child {
    display: flex;
    align-self: end;
    padding: 1rem 2rem;
  }

  nav {
    display: grid;
    align-items: center;
    padding: 0 2em;

    .nav-link {
      color: var(--color-text-gray);
      font-size: 1.4em;
      line-height: 1.2;
      text-decoration: none;
      min-height: 30px;

      &:hover {
        color: var(--color-text-light);
      }
      &.nav-link-active {
        color: var(--color-text-light);
        font-weight: var(--font-weight-semibold);
        span {
          position: relative;
          &:after {
            content: "";
            display: block;
            position: absolute;
            right: -54px;
            top: 50%;
            width: 40px;
            height: 3px;
            background: var(--color-primary);
          }
        }
      }
    }
  }

  .copyright {
    font-size: 0.8rem;
  }
}
</style>
