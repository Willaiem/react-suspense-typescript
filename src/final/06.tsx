// Suspense with a custom hook
// http://localhost:3000/isolated/final/06.js

import * as React from 'react'
import {
  fetchPokemon,
  getImageUrlForPokemon, PokemonDataView,
  PokemonErrorBoundary, PokemonForm, PokemonInfoFallback
} from '../pokemon'
import { createResource, preloadImage } from '../utils'

type PokemonResource = ReturnType<typeof createPokemonResource>

function PokemonInfo({ pokemonResource }: { pokemonResource: PokemonResource }) {
  const pokemon = pokemonResource.data.read()
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemonResource.image.read()} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

const pokemonResourceCache: Record<string, PokemonResource> = {}

function getPokemonResource(name: string) {
  const lowerName = name.toLowerCase()
  let resource = pokemonResourceCache[lowerName]
  if (!resource) {
    resource = createPokemonResource(lowerName)
    pokemonResourceCache[lowerName] = resource
  }
  return resource
}

function createPokemonResource(pokemonName: string) {
  const data = createResource(fetchPokemon(pokemonName))
  const image = createResource(preloadImage(getImageUrlForPokemon(pokemonName)))
  return { data, image }
}

function usePokemonResource(pokemonName: string) {
  const [pokemonResource, setPokemonResource] = React.useState<PokemonResource | null>(null)
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [pokemonName, startTransition])

  return [pokemonResource, isPending] as const
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
