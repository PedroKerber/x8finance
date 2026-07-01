import { T } from '../../theme'
import { STATUS_RECEITA_PF } from '../../personalData'
import TxManager from './_TxManager'

export default function PersonalReceitas({ transactions, accounts, catsReceita, onSaveTx, onSaveTxBatch, onSaveRecurrence, onDeleteTx }) {
  return (
    <TxManager
      tipo="receita" title="Receitas" accent={T.green}
      cats={catsReceita} statusOptions={STATUS_RECEITA_PF}
      transactions={transactions} accounts={accounts}
      onSaveTx={onSaveTx} onSaveTxBatch={onSaveTxBatch} onSaveRecurrence={onSaveRecurrence} onDeleteTx={onDeleteTx}
    />
  )
}
