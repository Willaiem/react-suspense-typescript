import * as React from 'react'
import { ErrorBoundary, ErrorBoundaryProps } from 'react-error-boundary'
import type { PokemonData } from './types'
import { createResource, preloadImage } from './utils'

import pkg from '../package.json'

type PokemonResponse = {
  data: {
    pokemon: PokemonData
  }
  errors?: Error[]
}

const homepage = process.env.NODE_ENV === 'production' ? pkg.homepage : '/'

// You really only get the benefit of pre-loading an image when the cache-control
// is set to cache the image for some period of time. We can't do that with our
// local server, but we are hosting the images on netlify so we can use those
// instead. Note our public/_headers file that forces these to cache.
const fallbackImgUrl = `${homepage}img/pokemon/fallback-pokemon.jpg`
preloadImage(`${homepage}img/pokeball.png`)
preloadImage(fallbackImgUrl)

const sleep = (t: number) => new Promise(resolve => setTimeout(resolve, t))

const formatDate = (date: Date) =>
  `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${String(
    date.getSeconds(),
  ).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`

// this gives me syntax highlighting and prettier formatting
// for graphql queries.
const graphql = String.raw

// the delay argument is for faking things out a bit
function fetchPokemon(name: string, delay: number = 1500) {
  const endTime = Date.now() + delay
  const pokemonQuery = graphql`
    query PokemonInfo($name: String) {
      pokemon(name: $name) {
        id
        number
        name
        image
        attacks {
          special {
            name
            type
            damage
          }
        }
      }
    }
  `


  return window
    .fetch('https://graphql-pokemon2.vercel.app', {
      // learn more about this API here: https://graphql-pokemon2.vercel.app
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: pokemonQuery,
        variables: { name: name.toLowerCase() },
      }),
    })
    .then(response => response.json() as Promise<PokemonResponse>)
    .then(async response => {
      await sleep(endTime - Date.now())
      return response
    })
    .then(response => {
      if (response.errors) {
        return Promise.reject(
          new Error(response.errors.map(e => e.message).join('\n')),
        )
      }
      const pokemon = response.data.pokemon
      if (pokemon) {
        pokemon.fetchedAt = formatDate(new Date())
        return pokemon
      } else {
        return Promise.reject(new Error(`No pokemon with the name "${name}"`))
      }
    })
}

function getImageUrlForPokemon(pokemonName: PokemonData['name']) {
  return `${homepage}img/pokemon/${pokemonName.toLowerCase()}.jpg`
}

async function fetchUser(pokemonName: PokemonData['name'], delay: number = 0) {
  await sleep(delay)
  const lowerName = pokemonName.toLowerCase()
  const response = await window.fetch(`/pokemoney/${lowerName}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  const result = response.json() as Promise<PokemonData>
  return result
}

function PokemonInfoFallback({ name }: { name: string }) {
  const initialName = React.useRef(name).current
  const fallbackPokemonData: PokemonData = {
    id: 'loading-pokemon',
    name: initialName,
    number: 'XXX',
    image: '/img/pokemon/fallback-pokemon.jpg',
    color: 'black',
    attacks: {
      special: [
        { name: 'Loading Attack 1', type: 'Type', damage: -1 },
        { name: 'Loading Attack 2', type: 'Type', damage: -1 },
      ],
    },
    fetchedAt: 'loading...',
  }
  return (
    <div>
      <div className="pokemon-info__img-wrapper" >
        <img src={fallbackImgUrl} alt={initialName} />
      </div>
      <PokemonDataView pokemon={fallbackPokemonData} />
    </div>
  )
}

function PokemonDataView({ pokemon }: { pokemon: PokemonData }) {
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <section>
        <h2>
          {pokemon.name}
          <sup>{pokemon.number}</sup>
        </h2>
      </section>
      <section>
        <ul>
          {pokemon.attacks.special.map(attack => (
            <li key={attack.name}>
              <label>{attack.name}</label>:{' '}
              <span>
                {attack.damage < 0 ? 'XX' : attack.damage}{' '}
                <small>({attack.type})</small>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <small className="pokemon-info__fetch-time">{pokemon.fetchedAt}</small>
    </div>
  )
}

function PokemonForm({
  pokemonName: externalPokemonName,
  initialPokemonName = externalPokemonName ?? '',
  onSubmit,
}: {
  pokemonName?: string
  initialPokemonName?: string
  onSubmit: (newPokemonName: string) => void
}) {
  const [pokemonName, setPokemonName] = React.useState(initialPokemonName)

  // this is generally not a great idea. We're synchronizing state when it is
  // normally better to derive it https://kentcdodds.com/blog/dont-sync-state-derive-it
  // however, we're doing things this way to make it easier for the exercises
  // to not have to worry about the logic for this PokemonForm component.
  React.useEffect(() => {
    // note that because it's a string value, if the externalPokemonName
    // is the same as the one we're managing, this will not trigger a re-render
    if (typeof externalPokemonName === 'string') {
      setPokemonName(externalPokemonName)
    }
  }, [externalPokemonName])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPokemonName(e.currentTarget.value)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSubmit(pokemonName)
  }

  function handleSelect(newPokemonName: string) {
    setPokemonName(newPokemonName)
    onSubmit(newPokemonName)
  }


  return (
    <form onSubmit={handleSubmit} className="pokemon-form">
      <label htmlFor="pokemonName-input">Pokemon Name</label>
      <small>
        Try{' '}
        <button
          className="invisible-button"
          type="button"
          onClick={() => handleSelect('pikachu')}
        >
          "pikachu"
        </button>
        {', '}
        <button
          className="invisible-button"
          type="button"
          onClick={() => handleSelect('charizard')}
        >
          "charizard"
        </button>
        {', or '}
        <button
          className="invisible-button"
          type="button"
          onClick={() => handleSelect('mew')}
        >
          "mew"
        </button>
      </small>
      <div>
        <input
          className="pokemonName-input"
          id="pokemonName-input"
          name="pokemonName"
          placeholder="Pokemon Name..."
          value={pokemonName}
          onChange={handleChange}
        />
        <button type="submit" disabled={!pokemonName.length}>
          Submit
        </button>
      </div>
    </form>
  )
}

type PokemonResource = ReturnType<typeof createPokemonResource>

const PokemonResourceCacheContext = React.createContext<Record<string, PokemonResource | undefined>>({})

function usePokemonResourceCache() {
  const cache = React.useContext(PokemonResourceCacheContext)
  return React.useCallback(
    (name: string) => {
      const lowerName = name.toLowerCase()
      let resource = cache[lowerName]
      if (!resource) {
        resource = createPokemonResource(lowerName)
        cache[lowerName] = resource
      }
      return resource
    },
    [cache],
  )
}

function createPokemonResource(pokemonName: PokemonData['name']) {
  const data = createResource(fetchPokemon(pokemonName))
  const image = createResource(preloadImage(getImageUrlForPokemon(pokemonName)))
  return { data, image }
}

function usePokemonResource(pokemonName: PokemonData['name']) {
  const [pokemonResource, setPokemonResource] = React.useState<PokemonResource | null>(null)
  const [isPending, startTransition] = React.useTransition()
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

  return [pokemonResource, isPending] as const
}

type TErrorFallback = {
  canReset: boolean
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ canReset, error, resetErrorBoundary }: TErrorFallback) {
  return (
    <div role="alert">
      There was an error:{' '}
      <pre style={{ whiteSpace: 'normal' }}>{error.message}</pre>
      {canReset ? (
        <button onClick={resetErrorBoundary}>Try again</button>
      ) : null}
    </div>
  )
}

type TPokemonErrorBoundaryProps = Omit<ErrorBoundaryProps, 'FallbackComponent' | 'fallback' | 'fallbackRender'> & {
  children: React.ReactNode
}

function PokemonErrorBoundary(parentProps: TPokemonErrorBoundaryProps) {
  const canReset = Boolean(parentProps.onReset || parentProps.resetKeys)
  return (
    <ErrorBoundary
      fallbackRender={props => <ErrorFallback canReset={canReset} {...props} />}
      {...parentProps}
    />
  )
}

export {
  fetchPokemon,
  getImageUrlForPokemon,
  fetchUser,
  usePokemonResource,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
}
