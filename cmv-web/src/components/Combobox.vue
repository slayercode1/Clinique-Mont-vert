<script setup lang="ts">
import { Button } from '@/components/ui/button';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-vue-next';
import { ref } from 'vue';
import { FormControl } from './ui/form';

defineProps<{
  data: Array<{
    value: string;
    label: string;
  }>;
  name: string;
  setFieldValue: any;
}>();

const value = ref();
</script>

<template>
  <Popover class="w-full">
    <PopoverTrigger as-child>
      <FormControl>
        <Button variant="outline" role="combobox" class="w-full justify-between font-normal">
          {{ value ? data.find((item) => item.label === value)?.label : 'Select...' }}
          <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </FormControl>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command v-model="value">
        <CommandInput placeholder="Search..." />
        <CommandEmpty>No data found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="item in data"
              :key="item.value"
              :value="item.label"
              @select="
                () => {
                  setFieldValue(name, item.value);
                }
              "
            >
              <Check
                :class="cn('mr-2 h-4 w-4', value === item.value ? 'opacity-100' : 'opacity-0')"
              />
              {{ item.label }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
