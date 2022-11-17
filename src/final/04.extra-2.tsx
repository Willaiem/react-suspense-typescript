// Cache resources
// 💯 create a context provider
// http://localhost:3000/isolated/final/04.extra-2.js

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


const PokemonResourceCacheContext = React.createContext<((name: string) => PokemonResource) | null>(null)

function PokemonCacheProvider({ children }: { children: React.ReactNode }) {
  const cache = React.useRef<Record<string, PokemonResource>>({})

  const getPokemonResource = React.useCallback((name: string) => {
    const lowerName = name.toLowerCase()
    let resource = cache.current[lowerName]
    if (!resource) {
      resource = createPokemonResource(lowerName)
      cache.current[lowerName] = resource
    }
    return resource
  }, [])

  return (
    <PokemonResourceCacheContext.Provider value={getPokemonResource}>
      {children}
    </PokemonResourceCacheContext.Provider>
  )
}

function usePokemonResourceCache() {
  const context = React.useContext(PokemonResourceCacheContext)
  if (!context) {
    throw new Error(
      `usePokemonResourceCache should be used within a PokemonCacheProvider`,
    )
  }
  return context
}

function createPokemonResource(pokemonName: string) {
  return createResource(fetchPokemon(pokemonName))
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const [isPending, startTransition] = React.useTransition()
  const [pokemonResource, setPokemonResource] = React.useState<PokemonResource | null>(null)
  const getPokemonResource = usePokemonResourceCache()

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [getPokemonResource, pokemonName, startTransition])

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

function AppWithProvider() {
  return (
    <PokemonCacheProvider>
      <App />
    </PokemonCacheProvider>
  )
}

export default AppWithProvider
