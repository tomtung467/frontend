<template>
  <div class="input-wrapper">
    <input
      :type="inputType"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="auth-input"
    />

    <!-- 👁 icon -->
    <span
      v-if="type === 'password'"
      class="toggle"
      @click="togglePassword"
    >
      {{ show ? "🙈" : "👁" }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: String,
  placeholder: String,
  type: {
    type: String,
    default: "text",
  },
});

defineEmits(["update:modelValue"]);

const show = ref(false);

const inputType = computed(() => {
  if (props.type !== "password") return props.type;
  return show.value ? "text" : "password";
});

const togglePassword = () => {
  show.value = !show.value;
};
</script>

<style scoped>
.input-wrapper {
  position: relative;
  width: 100%;
}

.auth-input {
  width: 100%;
  padding: 12px 40px 12px 14px; /* chừa chỗ icon */
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  margin-bottom: 14px;
  font-size: 14px;
  box-sizing: border-box;
}

.toggle {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);

  cursor: pointer;
  font-size: 20px; /* to hơn */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>