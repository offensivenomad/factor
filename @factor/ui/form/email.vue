<template>
  <input
    :value="value"
    type="email"
    autocomplete="email"
    :required="$attrs.required"
    v-bind="$attrs"
    v-on="listeners"
  />
</template>
<script lang="ts">
import Vue from "vue"
export default Vue.extend({
  props: {
    value: { type: String, default: "" }
  },
  computed: {
    listeners() {
      return {
        ...this.$listeners,
        input: event => this.$emit("input", event.target.value)
      }
    }
  }
})
</script>
