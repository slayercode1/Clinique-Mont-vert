<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

withDefaults(
  defineProps<{
    data: any;
    url?: string;
    url_update?: boolean;
    url_detail?: string;
    detail: boolean;
    handleDelete?: () => void;
  }>(),
  {
    url_update: true,
  },
);

const router = useRouter();
</script>

<template>
  <AlertDialog>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button class="w-8 h-8 p-0" variant="ghost">
          <span class="sr-only">Open menu</span>
          <MoreHorizontal class="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          v-if="url_update"
          class="cursor-pointer"
          @click="
            () =>
              router.push({
                path: url,
                state: {
                  data: JSON.stringify(data),
                },
              })
          "
          >View Update
        </DropdownMenuItem>
        <DropdownMenuItem
          v-if="detail"
          class="cursor-pointer"
          @click="
            () =>
              router.push({
                path: url_detail,
                state: {
                  data: JSON.stringify(data),
                },
              })
          "
          >View vehicle details
        </DropdownMenuItem>

        <AlertDialogTrigger as-child>
          <DropdownMenuItem class="cursor-pointer"> Supprimer </DropdownMenuItem>
        </AlertDialogTrigger>
      </DropdownMenuContent>
    </DropdownMenu>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Etre vous sur de supprimer cette donner ?</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Non</AlertDialogCancel>
        <AlertDialogAction @click="handleDelete">Oui</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
