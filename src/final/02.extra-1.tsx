// Refactor useEffect to Suspense
// 💯 Suspense and Error Boundary positioning
// http://localhost:3000/isolated/final/02.extra-1.js

import * as React from 'react'
import {
  fetchPokemon, PokemonDataView,
  PokemonErrorBoundary, PokemonForm, PokemonInfoFallback
} from '../pokemon'
import { createResource } from '../utils'

type PokemonResource = ReturnType<typeof createPokemonResource>


function PokemonInfo({ pokemonResource }: { pokemonResource: PokemonResource }) {
  const pokemon = pokemonResource.read()
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

function createPokemonResource(pokemonName: string) {
  return createResource(fetchPokemon(pokemonName))
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const [pokemonResource, setPokemonResource] = React.useState<PokemonResource | null>(null)

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    setPokemonResource(createPokemonResource(pokemonName))
  }, [pokemonName])

  function handleSubmit(newPokemonName: string) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <React.Suspense
        fallback={
          <div className="pokemon-info">
            <PokemonInfoFallback name={pokemonName} />
          </div>
        }
      >
        <div className="pokemon-info">
          {pokemonResource ? (
            <PokemonErrorBoundary
              onReset={handleReset}
              resetKeys={[pokemonName]}
            >
              <PokemonInfo pokemonResource={pokemonResource} />
            </PokemonErrorBoundary>
          ) : (
            'Submit a pokemon'
          )}
        </div>
      </React.Suspense>
    </div>
  )
}

export default App
