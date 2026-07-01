import { T } from '../../theme'
import { STATUS_DESPESA_PF } from '../../personalData'
import TxManager from './_TxManager'

export default function PersonalDespesas({ transactions, accounts, cards, catsDespesa, onSaveTx, onDeleteTx }) {
  return (
    <TxManager
      tipo="despesa" title="Despesas" accent={T.red}
      cats={catsDespesa} statusOptions={STATUS_DESPESA_PF}
      transactions={transactions} accounts={accounts} cards={cards}
      onSaveTx={onSaveTx} onDeleteTx={onDeleteTx}
    />
  )
}
