import React, { useCallback, useReducer } from 'react'

import PricesContext from './context'
import pricesReducer, { initialState, setPrices, setAssets } from './reducer'
import { AssetsData, PricesData } from './types'

const Prices: React.FC = (props) => {
  const [state, dispatch] = useReducer(pricesReducer, initialState)

  const handlePrices = useCallback(
    async (asset) => {
      let pricesData: PricesData = {}
      let assetsData: AssetsData = {}
      const priceAPI = `https://api.coingecko.com/api/v3/simple/price?ids=${asset}&vs_currencies=usd&include_24hr_change=true`
      fetch(priceAPI)
        .then((res) => res.json())
        .then(
          (result) => {
            let key = Object.keys(result)[0]
            let price = result[key].usd
            let asset = result[key]
            Object.assign(pricesData, {
              [key]: price,
            })
            Object.assign(assetsData, {
              [key]: asset,
            })
            dispatch(setPrices(pricesData))
            dispatch(setAssets(assetsData))
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            Object.assign(pricesData, {
              error,
            })
            console.log(error)
          }
        )
    },
    [dispatch]
  )

  return (
    <PricesContext.Provider
      value={{
        prices: state.prices,
        getPrices: handlePrices,
        assets: state.assets,
      }}
    >
      {props.children}
    </PricesContext.Provider>
  )
}

export default Prices
