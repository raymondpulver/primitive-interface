import {
  SerializableTransactionReceipt,
  Transaction,
  TransactionState,
} from './types'

import { ChainId } from '@uniswap/sdk'

export const initialState = { 1: {}, 3: {}, 4: {}, 5: {}, 42: {} }

export interface AddTransactionAction {
  type: string
  chainId: ChainId
  tx: Transaction
}

export interface ClearAllTransactionsAction {
  type: string
  chainId: ChainId
}

export interface FinalizeTransactionsAction {
  type: string
  chainId: ChainId
  receipt: SerializableTransactionReceipt
  tx: Transaction
}

export interface CheckedTransactionAction {
  type: string
  chainId: ChainId
  blockNumber: number
  tx: Transaction
}

export type TransactionAction =
  | AddTransactionAction
  | ClearAllTransactionsAction
  | FinalizeTransactionsAction
  | CheckedTransactionAction

export const addTransaction = (
  chainId: ChainId,
  tx: Transaction
): AddTransactionAction => ({
  type: 'ADD',
  chainId,
  tx,
})
export const clearAllTransactions = (
  chainId: ChainId
): ClearAllTransactionsAction => ({
  type: 'CLEAR',
  chainId,
})
export const finalizeTransaction = (
  chainId: ChainId,
  receipt: SerializableTransactionReceipt,
  tx: Transaction
): FinalizeTransactionsAction => ({
  type: 'FINALIZE',
  chainId,
  receipt,
  tx,
})
export const checkTransaction = (
  chainId: ChainId,
  blockNumber: number,
  tx: Transaction
): CheckedTransactionAction => ({
  type: 'CHECKED',
  chainId,
  blockNumber,
  tx,
})

// using any to infer action type -> TODO: make the interfaces work
const reducer = (state: TransactionState = initialState, action: any) => {
  const now = () => new Date().getTime()
  switch (action.type) {
    case 'ADD':
      return {
        ...state,
        [action.chainId]: { [action.tx.hash]: action.tx },
      }
    case 'CLEAR':
      return {
        ...state,
        [action.chainId]: {},
      }
    case 'FINALIZE':
      /*eslint-disable-next-line*/
      const fin = action.tx
      fin.receipt = action.receipt
      fin.confirmedTime = now()
      return {
        ...state,
        [action.chainId]: { [action.tx.hash]: fin },
      }
    case 'CHECKED':
      /*eslint-disable-next-line*/
      const check = action.tx
      if (!check.lastCheckedBlockNumber) {
        check.lastCheckedBlockNumber = action.blockNumber
      } else
        check.lastCheckedBlockNumber = Math.max(
          action.blockNumber,
          check.lastCheckedBlockNumber
        )
      return {
        ...state,
        [action.chainId]: { [action.tx.hash]: check },
      }
    default:
      throw new Error()
  }
}

export default reducer
