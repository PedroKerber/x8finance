import { T } from '../../theme'
import { CATS_DESPESA_PF, STATUS_DESPESA_PF } from '../../personalData'
import TxManager from './_TxManager'

export default function PersonalDespesas({ transactions, accounts, onSaveTx, onDeleteTx }) {
  return (
    <TxManager
      tipo="despesa" title="Despesas" accent={T.red}
      cats={CATS_DESPESA_PF} statusOptions={STATUS_DESPESA_PF}
      transactions={transactions} accounts={accounts}
      onSaveTx={onSaveTx} onDeleteTx={onDeleteTx}
    />
  )
}
