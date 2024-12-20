<script setup lang="ts">
import type { FieldProps } from './interface';
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '../form';
import { Input } from '../input';
import { Textarea } from '../textarea';
import { computed, ref } from 'vue';
import AutoFormLabel from './AutoFormLabel.vue';
import { LucideEye, LucideEyeOff } from 'lucide-vue-next';
import { beautifyObjectName } from './utils';

const props = defineProps<FieldProps>();
const inputComponent: any = computed(() =>
  props.config?.component === 'textarea' ? Textarea : Input,
);

const isPasswordVisible = ref<boolean>(true);
</script>

<template>
  <FormField v-slot="slotProps" :name="fieldName">
    <FormItem v-bind="$attrs">
      <AutoFormLabel v-if="!config?.hideLabel" :required="required">
        {{ config?.label || beautifyObjectName(label ?? fieldName) }}
      </AutoFormLabel>
      <FormControl>
        <slot v-bind="slotProps">
          <div class="relative">
            <component
              :is="inputComponent"
              :type="isPasswordVisible ? 'password' : 'text'"
              v-bind="{ ...slotProps.componentField, ...config?.inputProps }"
              :disabled="disabled"
              class="pr-10"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center px-2"
              @click="isPasswordVisible = !isPasswordVisible"
              :aria-label="
                isPasswordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
              "
            >
              <LucideEye v-if="isPasswordVisible" class="h-5 w-5 text-gray-500" />
              <LucideEyeOff v-else class="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </slot>
      </FormControl>
      <FormDescription v-if="config?.description">
        {{ config.description }}
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
e>
