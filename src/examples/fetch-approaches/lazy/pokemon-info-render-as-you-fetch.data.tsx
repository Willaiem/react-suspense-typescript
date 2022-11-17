// http://localhost:3000/isolated/examples/fetch-approaches/lazy/pokemon-info-render-as-you-fetch.data.js

import { PokemonData } from 'types'
import { fetchPokemon, getImageUrlForPokemon } from '../../../pokemon'
import { createResource, preloadImage } from '../../../utils'

function createPokemonResource(pokemonName: PokemonData['name']) {
  const data = createResource(fetchPokemon(pokemonName))
  const image = createResource(preloadImage(getImageUrlForPokemon(pokemonName)))
  return { data, image }
}

export default createPokemonResource
