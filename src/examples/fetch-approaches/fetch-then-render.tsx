// Fetch then render 👎
// http://localhost:3000/isolated/examples/fetch-approaches/fetch-then-render.js

import * as React from 'react'
import { PokemonData } from 'types'
import { fetchPokemon, PokemonForm, PokemonInfoFallback } from '../../pokemon'

const PokemonInfo = React.lazy(() =>
  import('./lazy/pokemon-info-fetch-then-render'),
)

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

function usePokemon(pokemonName: string) {
  const [state, setState] = React.useReducer<PokemonInfoReducer>((s, a) => ({ ...s, ...a }), {
    pokemon: null,
    error: null,
    status: 'pending',
  })

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

  return state
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const { pokemon, error, status } = usePokemon(pokemonName)

  function handleSubmit(newPokemonName: string) {
    setPokemonName(newPokemonName)
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>
        {'Fetch then render '}
        <span role="img" aria-label="thumbs down">
          👎
        </span>
      </h1>
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        {!pokemonName && "Submit a pokemon"}
        {status === 'pending' && <PokemonInfoFallback name={pokemonName} />}

        {status === 'error' && error && (
          <div>
            There was an error.
            <pre style={{ whiteSpace: 'normal' }}>{error.message}</pre>
          </div>
        )}

        {status === 'success' && pokemon && (
          <React.Suspense
            fallback={<PokemonInfoFallback name={pokemonName} />}
          >
            <PokemonInfo pokemon={pokemon} />
          </React.Suspense>
        )}
      </div>
    </div>
  )
}

export default App
