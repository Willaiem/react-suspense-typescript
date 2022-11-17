// http://localhost:3000/isolated/examples/fetch-approaches/lazy/pokemon-info-fetch-on-render.js

import * as React from 'react'
import { PokemonData } from 'types'
import {
  fetchPokemon, PokemonDataView, PokemonInfoFallback
} from '../../../pokemon'

type PokemonInfoState = {
  status: 'pending' | 'success' | 'error'
  pokemon: PokemonData | null
  error: Error | null
}

type PokemonInfoAction =
  | {
    status: 'pending'
    error?: null
    pokemon?: null
  }
  | {
    status: 'success'
    pokemon: PokemonData
  }
  | {
    status: 'error'
    error: Error
  }

type PokemonInfoReducer = React.Reducer<PokemonInfoState, PokemonInfoAction>

function PokemonInfo({ pokemonName }: { pokemonName: PokemonData['name'] }) {
  const [state, setState] = React.useReducer<PokemonInfoReducer>((s, a) => ({ ...s, ...a }), {
    pokemon: null,
    error: null,
    status: 'pending',
  })

  const { status, error, pokemon } = state

  React.useEffect(() => {
    let current = true
    setState({ status: 'pending' })
    fetchPokemon(pokemonName).then(
      p => {
        if (current) setState({ pokemon: p, status: 'success' })
      },
      e => {
        if (current) setState({ error: e, status: 'error' })
      },
    )
    return () => {
      current = false
    }
  }, [pokemonName])

  if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  }

  if (status === 'error' && error) {
    return (
      <div>
        There was an error.
        <pre style={{ whiteSpace: 'normal' }}>{error.message}</pre>
      </div>
    )
  }

  if (status === 'success' && pokemon) {
    return (
      <div>
        <div className="pokemon-info__img-wrapper">
          <img src={pokemon.image} alt={pokemon.name} />
        </div>
        <PokemonDataView pokemon={pokemon} />
      </div>
    )
  }

  throw new Error('Imposible...')
}

export default PokemonInfo
