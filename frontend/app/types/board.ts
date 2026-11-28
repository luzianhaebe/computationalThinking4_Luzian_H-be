// A board holds objects; every object belongs to exactly one board.
export interface Board {
  id: string
  name: string
  createdAt: string
  // Only the overview gets the members of a board.
  members?: Member[]
}

// Someone who belongs to a board, as far as the overview shows them.
export interface Member {
  name?: string
  avatarUrl?: string
}
