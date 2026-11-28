<script setup lang="ts">
import type { Board } from '~/types/board'
import { LogOut as LogOutIcon, Pencil as PencilIcon, Plus as PlusIcon, Trash2 as TrashIcon, UserPlus as UserPlusIcon } from '@lucide/vue'

// Overview of my boards: open, create, rename and delete them, and add members.
// Without a login there is nothing to show but the login button.
const { boards, load, addBoard, renameBoard, removeBoard, addMember } = useBoards()
const { user, loginUrl, load: loadUser, logout } = useAuth()
await loadUser()
if (user.value) await load()

async function onAddMember(board: Board) {
  const email = window.prompt(`Wen möchtest du zu „${board.name}“ hinzufügen? (Mail)`)
  if (email && !(await addMember(board.id, email))) {
    window.alert('Unter dieser Mail hat sich noch niemand angemeldet.')
  }
}

async function onAdd() {
  const name = window.prompt('Wie soll das Board heißen?', 'Neues Board')
  if (name) await navigateTo(`/boards/${await addBoard(name)}`)
}

function onRename(board: Board) {
  const name = window.prompt('Neuer Name', board.name)
  if (name && name !== board.name) renameBoard(board.id, name)
}

// Deleting a board also deletes every object on it, so ask first.
function onRemove(board: Board) {
  if (window.confirm(`„${board.name}“ und alles darauf löschen?`)) removeBoard(board.id)
}
</script>

<template>
  <main v-if="!user" class="flex min-h-screen items-center justify-center">
    <Button as="a" :href="loginUrl" variant="outline">
      Mit Google anmelden
    </Button>
  </main>

  <main v-else class="mx-auto max-w-5xl p-8">
    <div class="mb-8 flex items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold">
        Boards
      </h1>
      <div class="flex items-center gap-3">
        <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="" referrerpolicy="no-referrer" class="size-8 rounded-full">
        <span class="text-sm font-medium">{{ user.name }}</span>
        <Button variant="ghost" size="icon-sm" aria-label="Abmelden" @click="logout">
          <LogOutIcon />
        </Button>
        <Button @click="onAdd">
          <PlusIcon />
          Neues Board
        </Button>
      </div>
    </div>

    <p v-if="!boards.length" class="text-muted-foreground">
      Noch keine Boards – leg das erste an.
    </p>

    <ul class="flex flex-col gap-3">
      <li
        v-for="board in boards"
        :key="board.id"
        class="group relative rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <NuxtLink :to="`/boards/${board.id}`" class="flex items-center gap-4 py-4 pl-5 pr-32">
          <span class="truncate font-medium">{{ board.name }}</span>
          <span class="shrink-0 text-sm text-muted-foreground">{{ new Date(board.createdAt).toLocaleDateString('de-DE') }}</span>
          <span class="ml-auto flex shrink-0 -space-x-2">
            <template v-for="(member, i) in board.members" :key="i">
              <img
                v-if="member.avatarUrl"
                :src="member.avatarUrl"
                :alt="member.name"
                :title="member.name"
                referrerpolicy="no-referrer"
                class="size-7 rounded-full ring-2 ring-white"
              >
              <span
                v-else
                :title="member.name"
                class="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-white"
              >{{ member.name?.[0] ?? '?' }}</span>
            </template>
          </span>
        </NuxtLink>
        <div class="absolute right-3 top-1/2 flex -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Button variant="ghost" size="icon-sm" aria-label="Mitglied hinzufügen" @click="onAddMember(board)">
            <UserPlusIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Rename board" @click="onRename(board)">
            <PencilIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Delete board" @click="onRemove(board)">
            <TrashIcon />
          </Button>
        </div>
      </li>
    </ul>
  </main>
</template>
