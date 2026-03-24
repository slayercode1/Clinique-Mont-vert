<script lang="ts" setup>
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const props = withDefaults(
  defineProps<{
    data: any;
    url?: string;
    url_update?: boolean;
    url_detail?: string;
    detail: boolean;
    handleDelete?: () => void;
    onViewUpdate?: () => void;
  }>(),
  {
    url_update: true,
  }
);

const emit = defineEmits<{
  (e: 'viewUpdate'): void;
}>();

const router = useRouter();

const handleViewUpdate = () => {
  if (props.onViewUpdate) {
    props.onViewUpdate();
  } else if (props.url) {
    router.push({
      path: props.url,
      state: {
        data: JSON.stringify(props.data),
      },
    });
  }
};
</script>

<template>
  <AlertDialog>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button class="w-8 h-8 p-0" variant="ghost">
          <span class="sr-only">Ouvrir le menu</span>
          <MoreHorizontal class="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          v-if="url_update"
          class="cursor-pointer"
          @click="handleViewUpdate"
          >Modifier
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
          >Voir les détails
        </DropdownMenuItem>

        <AlertDialogTrigger as-child>
          <DropdownMenuItem class="cursor-pointer"> Supprimer </DropdownMenuItem>
        </AlertDialogTrigger>
      </DropdownMenuContent>
    </DropdownMenu>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ?</AlertDialogTitle>
        <AlertDialogDescription>
          Cette action est irréversible. L'élément sera définitivement supprimé.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Annuler</AlertDialogCancel>
        <AlertDialogAction @click="handleDelete">Confirmer</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
