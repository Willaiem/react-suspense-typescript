// Render as you Fetch 👍
// http://localhost:3000/isolated/examples/fetch-approaches/render-as-you-fetch.js

import * as React from 'react'
import {
  PokemonErrorBoundary, PokemonForm, PokemonInfoFallback
} from '../../pokemon'
import createPokemonInfoResource from './lazy/pokemon-info-render-as-you-fetch.data'

const PokemonInfo = React.lazy(() =>
  import('./lazy/pokemon-info-render-as-you-fetch'),
)

type PokemonResource = ReturnType<typeof createPokemonInfoResource>

const pokemonResourceCache: Record<string, PokemonResource> = {}

function getPokemonResource(name: string) {
  const lowerName = name.toLowerCase()
  let resource = pokemonResourceCache[lowerName]
  if (!resource) {
    resource = createPokemonInfoResource(lowerName)
    pokemonResourceCache[lowerName] = resource
  }
  return resource
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
    <div>
      <h1 style={{ textAlign: 'center' }}>
        {'Render as you fetch '}
        <span role="img" aria-label="thumbs up">
          👍
        </span>
      </h1>
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
