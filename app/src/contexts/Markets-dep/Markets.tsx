import React, { useCallback, useEffect, useState } from 'react'

import Context from './context'
import { Market } from './types'

const NAME_FOR_POOL: { [key: string]: string } = {
  eth_market: 'Weth',
  soon_market: 'Soon...',
  future_market: 'Soon...',
}

const ICON_FOR_POOL: { [key: string]: React.ReactNode } = {
  eth_market: (
    <img
      height="64"
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/1280px-Ethereum-icon-purple.svg.png"
      style={{ filter: 'brightness(2) grayscale(1)' }}
      alt={'ether icon'}
    />
  ),
  soon_market: '',
  future_market: '',
}

const SORT_FOR_POOL: { [key: string]: number } = {
  eth_market: 2,
  soon_market: 1,
  future_market: 0,
}

const Markets: React.FC = ({ children }) => {
  const [markets, setMarkets] = useState<Market[]>([])

  const fetchMarkets = useCallback(async () => {
    const marketsArr: Market[] = []
    const marketKeys = ['eth_market', 'soon_market', 'future_market']
    console.log(marketKeys)
    for (let i = 0; i < marketKeys.length; i++) {
      const marketKey = marketKeys[i]
      let tokenKey = marketKey.replace('_market', '')
      if (tokenKey === 'eth') {
        tokenKey = 'weth'
      }

      if (tokenKey === 'soon' || tokenKey === 'future') {
        tokenKey = 'tbd'
      }

      try {
        marketsArr.push({
          name: NAME_FOR_POOL[marketKey],
          icon: ICON_FOR_POOL[marketKey],
          id: tokenKey,
          sort: SORT_FOR_POOL[marketKey],
        })
      } catch (e) {
        console.log(e)
      }
    }
    marketsArr.sort((a, b) => (a.sort < b.sort ? 1 : -1))
    setMarkets(marketsArr)
  }, [setMarkets])

  useEffect(() => {
    fetchMarkets()
  }, [fetchMarkets])

  return (
    <Context.Provider
      value={{
        markets,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export default Markets
