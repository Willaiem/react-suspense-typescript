// http://localhost:3000/isolated/examples/fetch-approaches/lazy/pokemon-info-render-as-you-fetch.js

import { PokemonData } from 'types'
import { PokemonDataView } from '../../../pokemon'

type DataResource = { read: () => PokemonData }
type ImageResource = { read: () => string }

function PokemonInfo({ pokemonResource }: { pokemonResource: { data: DataResource, image: ImageResource } }) {
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

export default PokemonInfo
