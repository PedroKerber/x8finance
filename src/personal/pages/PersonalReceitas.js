import { T } from '../../theme'
import { CATS_RECEITA_PF, STATUS_RECEITA_PF } from '../../personalData'
import TxManager from './_TxManager'

export default function PersonalReceitas({ transactions, accounts, onSaveTx, onDeleteTx }) {
  return (
    <TxManager
      tipo="receita" title="Receitas" accent={T.green}
      cats={CATS_RECEITA_PF} statusOptions={STATUS_RECEITA_PF}
      transactions={transactions} accounts={accounts}
      onSaveTx={onSaveTx} onDeleteTx={onDeleteTx}
    />
  )
}
