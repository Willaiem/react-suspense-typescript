// http://localhost:3000/isolated/examples/fetch-approaches/lazy/pokemon-info-fetch-then-render.js

import { PokemonData } from 'types'
import { PokemonDataView } from '../../../pokemon'

function PokemonInfo({ pokemon }: { pokemon: PokemonData }) {
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

export default PokemonInfo
