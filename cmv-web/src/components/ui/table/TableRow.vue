<script setup lang="ts">
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'vue';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <tr
    :class="
      cn(
        'transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer',
        props.class,
      )
    "
  >
    <slot />
  </tr>
</template>
