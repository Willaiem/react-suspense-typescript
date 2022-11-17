// Suspense Image
// 💯 Render as you Fetch
// http://localhost:3000/isolated/final/05.extra-2.js

import * as React from 'react'
import {
  fetchPokemon,
  getImageUrlForPokemon, PokemonErrorBoundary, PokemonForm, PokemonInfoFallback
} from '../pokemon'
import { createResource } from '../utils'

type PokemonResource = ReturnType<typeof createPokemonResource>

const PokemonInfo = React.lazy(() =>
  import('../lazy/pokemon-info-render-as-you-fetch'),
)

// ❗❗❗❗
// 🦉 On this one, make sure that you UNCHECK the "Disable cache" checkbox
// in your DevTools "Network Tab". We're relying on that cache for this
// approach to work!
// ❗❗❗❗

function preloadImage(src: string) {
  return new Promise<string>(resolve => {
    const img = document.createElement('img')
    img.src = src
    img.onload = () => resolve(src)
  })
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

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const [isPending, startTransition] = React.useTransition()
  const [pokemonResource, setPokemonResource] = React.useState<PokemonResource | null>(null)

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [pokemonName, startTransition])

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
