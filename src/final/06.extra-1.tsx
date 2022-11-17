// Suspense with a custom hook
// 💯 use the usePokemonResource pre-built hook
// http://localhost:3000/isolated/final/06.extra-1.js

import * as React from 'react'
import {
  PokemonDataView,
  PokemonErrorBoundary, PokemonForm, PokemonInfoFallback, usePokemonResource
} from '../pokemon'

type PokemonResource = ReturnType<typeof usePokemonResource>['0']

function PokemonInfo({ pokemonResource }: { pokemonResource: PokemonResource }) {
  const pokemon = pokemonResource?.data.read()
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemonResource?.image.read()} alt={pokemon?.name} />
      </div>
      {pokemon && <PokemonDataView pokemon={pokemon} />}
    </div>
  )
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  const [pokemonResource, isPending] = usePokemonResource(pokemonName)

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
      <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}>
        {pokemonResource ? (
          <PokemonErrorBoundary
            onReset={handleReset}
            resetKeys={[pokemonResource]}
          >
            <React.Suspense
              fallback={<PokemonInfoFallback name={pokemonName} />}
            >
              <PokemonInfo pokemonResource={pokemonResource} />
            </React.Suspense>
          </PokemonErrorBoundary>
        ) : (
          'Submit a pokemon'
        )}
      </div>
    </div>
  )
}

export default App
