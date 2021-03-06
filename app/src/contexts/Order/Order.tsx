import React, { useCallback, useReducer } from 'react'
import ethers from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { Transaction } from '@/contexts/Transactions/types'
import OrderContext from './context'
import { OrderItem, NewOptionItem } from './types'
import reducer, {
  addItem,
  initialState,
  changeItem,
  removeItem,
  newOption,
} from './reducer'

import { DEFAULT_DEADLINE, DEFAULT_TIMELIMIT } from '@/constants/index'

import { Asset } from '@/lib/entities'
import { create, mintTestToken } from '@/lib/primitive'
import { Operation } from '@/lib/constants'
import { Option, createOptionEntityWithAddress } from '@/lib/entities/option'
import { parseEther } from 'ethers/lib/utils'
import { Quantity } from '@/lib/entities'
import { Trade } from '@/lib/entities'
import { Trader } from '@/lib/trader'
import { Uniswap, TradeSettings, SinglePositionParameters } from '@/lib/uniswap'

import executeTransaction from '@/lib/utils/executeTransaction'
import UniswapPairs from './uniswap_pairs.json'
import useTransactions from '@/hooks/transactions/index'
import { useSlippage } from '@/hooks/user'

const Order: React.FC = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { chainId, account } = useWeb3React()
  const { addTransaction } = useTransactions()
  const [slippage] = useSlippage()
  const now = () => new Date().getTime()

  const handleAddItem = useCallback(
    (item: OrderItem | NewOptionItem, orderType: string) => {
      dispatch(addItem(item, orderType))
    },
    [dispatch]
  )

  const handleChangeItem = useCallback(
    (item: OrderItem, orderType: string) => {
      dispatch(changeItem(item, orderType))
    },
    [dispatch]
  )

  const handleRemoveItem = useCallback(
    (item: OrderItem | NewOptionItem) => {
      dispatch(removeItem(item))
    },
    [dispatch]
  )

  const handleSubmitOrder = async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number,
    operation: Operation
  ) => {
    const stablecoinAddress = UniswapPairs[state.item.id].stablecoinAddress
    const signer: ethers.Signer = await provider.getSigner()
    const receiver: string = await signer.getAddress()
    const tradeSettings: TradeSettings = {
      slippage: slippage,
      timeLimit: DEFAULT_TIMELIMIT,
      receiver: receiver,
      deadline: DEFAULT_DEADLINE,
      stablecoin: stablecoinAddress,
    }

    const optionEntity: Option = createOptionEntityWithAddress(
      chainId,
      optionAddress
    )
    const inputAmount: Quantity = new Quantity(
      new Asset(18), // fix with actual metadata
      parseEther(quantity.toString())
    )
    const trade: Trade = new Trade(optionEntity, inputAmount, operation, signer)

    let transaction: SinglePositionParameters
    switch (operation) {
      case Operation.LONG:
        transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
        break
      case Operation.SHORT:
        transaction = Uniswap.singlePositionCallParameters(trade, tradeSettings)
        break
      default:
        transaction = Trader.singleOperationCallParameters(trade, tradeSettings)
        break
    }

    const tx: Transaction = await executeTransaction(signer, transaction)
    if (tx.hash) {
      addTransaction(chainId, {
        hash: tx.hash,
        addedTime: now(),
        from: account,
      })
    }
  }

  // Needs to be updated
  const handleCreateOption = async (
    provider: Web3Provider,
    asset,
    isCallType,
    expiry,
    strike
  ) => {
    const signer = await provider.getSigner()

    const tx = await create(signer, asset, isCallType, expiry, strike)
    if (tx.hash) {
      addTransaction(chainId, {
        hash: tx.hash,
        addedTime: now(),
        from: account,
      })
    }
  }

  const handleMintTestTokens = async (
    provider: Web3Provider,
    optionAddress: string,
    quantity: number
  ) => {
    const signer = await provider.getSigner()

    const tx = await mintTestToken(signer, optionAddress, quantity)
    if (tx.hash) {
      addTransaction(chainId, {
        hash: tx.hash,
        addedTime: now(),
        from: account,
      })
    }
  }

  const handleProvideLiquidity = async (
    provider: Web3Provider,
    optionAddress: string,
    min_l: number,
    max_tokens: number
  ) => {
    const signer = await provider.getSigner()

    const tx = await mintTestToken(signer, optionAddress, quantity)
    if (tx.hash) {
      addTransaction(chainId, {
        hash: tx.hash,
        addedTime: now(),
        from: account,
      })
    }
  }

  const handleWithdrawLiquidity = async (
    provider: Web3Provider,
    optionAddress: string,
    min_l: number,
    min_tokens: number
  ) => {
    const signer = await provider.getSigner()

    const tx = await mintTestToken(signer, optionAddress, quantity)
    if (tx.hash) {
      addTransaction(chainId, {
        hash: tx.hash,
        addedTime: now(),
        from: account,
      })
    }
  }

  return (
    <OrderContext.Provider
      value={{
        item: state.item,
        orderType: state.orderType,
        onAddItem: handleAddItem,
        onChangeItem: handleChangeItem,
        onRemoveItem: handleRemoveItem,
        submitOrder: handleSubmitOrder,
        createOption: handleCreateOption,
        mintTestTokens: handleMintTestTokens,
        provideLiquidity: handleProvideLiquidity,
        withdrawLiquidity: handleWithdrawLiquidity,
      }}
    >
      {props.children}
    </OrderContext.Provider>
  )
}

export default Order
