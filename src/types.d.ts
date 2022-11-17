type PokemonData = {
  id: string
  number: string
  name: string
  image: string
  fetchedAt: string
  color: string
  transactions?: {
    id: string
    recipient: string
    amount: number
    message: string
  }[]
  friends?: string[]
  attacks: {
    special: Array<{
      name: string
      type: string
      damage: number
    }>
  }
}

export { PokemonData }
