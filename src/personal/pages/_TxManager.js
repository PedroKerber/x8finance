import { useState, useMemo } from 'react'
import { T, fmt, fd, uid, errMsgAcao } from '../../theme'
import { Card, Btn, Modal, Input, Select, Table, Toast, Confirm, EmptyState, StatusBadge } from '../../components/ui'
import { FORMAS_PAGAMENTO_PF, RECORRENCIAS_PF } from '../../personalData'

// Gerenciador genérico de transações pessoais (receita/despesa).
// Reusado por PersonalReceitas e PersonalDespesas.
export default function TxManager({ tipo, title, accent, cats, statusOptions, transactions, accounts, onSaveTx, onDeleteTx }) {
  const isReceita = tipo === 'receita'
  const hoje = new Date().toISOString().slice(0, 10)
  const mesAtual = hoje.slice(0, 7)

  const [mes, setMes] = useState(mesAtual)
  const [fCat, setFCat] = useState('')
  const [modal, setModal] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState(null)

  const catNome = (id) => cats.find(c => c.id === id)?.nome || id || '—'
  const catCor  = (id) => cats.find(c => c.id === id)?.cor || T.muted
  const contaNome = (id) => accounts.find(a => a.id === id)?.nome || '—'

  const lista = useMemo(() => {
    let l = transactions.filter(t => t.tipo === tipo)
    if (mes) l = l.filter(t => (t.data || '').startsWith(mes))
    if (fCat) l = l.filter(t => t.categoria === fCat)
    return l
  }, [transactions, tipo, mes, fCat])

  const total = useMemo(() => lista.reduce((s, t) => s + (t.valor || 0), 0), [lista])

  const novo = () => {
    setForm({ id: uid(), tipo, data: hoje, valor: '', categoria: cats[0]?.id || '', desc: '',
      accountId: accounts[0]?.id || '', forma: isReceita ? '' : 'Pix',
      recorrencia: isReceita ? '' : 'Único', status: statusOptions[0], anexoUrl: '', _edit: false })
    setModal(true)
  }
  const editar = (row) => { setForm({ ...row, valor: String(row.valor ?? ''), _edit: true }); setModal(true) }

  const salvar = async () => {
    const valorNum = parseFloat(String(form.valor).replace(',', '.')) || 0
    if (valorNum <= 0) { setToast({ msg: 'Informe um valor válido.', type: 'error' }); return }
    const item = { ...form, valor: valorNum }
    delete item._edit
    try {
      await onSaveTx(item, form._edit)
      setModal(false); setForm(null)
      setToast({ msg: form._edit ? 'Atualizado com sucesso!' : 'Lançamento salvo!', type: 'success' })
    } catch (e) { setToast({ msg: errMsgAcao(e), type: 'error' }) }
  }

  const excluir = async () => {
    try { await onDeleteTx(confirmId); setToast({ msg: 'Excluído.', type: 'success' }) }
    catch (e) { setToast({ msg: errMsgAcao(e), type: 'error' }) }
    setConfirmId(null)
  }

  const columns = [
    { key: 'data', label: 'Data', render: v => fd(v) },
    { key: 'desc', label: 'Descrição', render: (v, r) => v || catNome(r.categoria) },
    { key: 'categoria', label: 'Categoria', render: v => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: catCor(v) }} />{catNome(v)}
      </span>
    )},
    { key: 'accountId', label: 'Conta', render: v => contaNome(v) },
    { key: 'status', label: 'Status', render: v => v ? <StatusBadge status={v} /> : '—' },
    { key: 'valor', label: 'Valor', render: v => <span style={{ fontWeight: 700, color: accent }}>{fmt(v)}</span> },
    { key: 'id', label: '', render: (_v, r) => (
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <Btn sm variant="ghost" onClick={() => editar(r)}>Editar</Btn>
        <Btn sm variant="ghost" onClick={() => setConfirmId(r.id)} style={{ color: T.red, borderColor: T.red }}>Excluir</Btn>
      </div>
    )},
  ]

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      {confirmId && <Confirm msg="Deseja excluir este lançamento?" onYes={excluir} onNo={() => setConfirmId(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 26, margin: 0, color: T.text }}>{title}</h1>
          <div style={{ color: T.sub, fontSize: 14, marginTop: 2 }}>Controle suas {title.toLowerCase()} pessoais.</div>
        </div>
        <Btn onClick={novo} icon="+">Nova {isReceita ? 'receita' : 'despesa'}</Btn>
      </div>

      {/* Resumo + filtros */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'stretch', marginBottom: 18 }}>
        <Card style={{ padding: '14px 20px', flex: '1 1 220px' }}>
          <div style={{ fontSize: 12, color: T.sub }}>Total no período</div>
          <div style={{ fontWeight: 800, fontSize: 24, color: accent, marginTop: 4 }}>{fmt(total)}</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{lista.length} lançamento(s)</div>
        </Card>
        <Card style={{ padding: '14px 16px', flex: '2 1 320px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 140px' }}>
            <label style={{ display: 'block', fontSize: 12, color: T.sub, fontWeight: 600, marginBottom: 4 }}>Mês</label>
            <input type="month" value={mes} onChange={e => setMes(e.target.value)}
              style={{ width: '100%', background: 'var(--card)', border: `1.5px solid var(--border)`, borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <Select label="Categoria" value={fCat} onChange={e => setFCat(e.target.value)} placeholder="Todas"
              options={cats.map(c => ({ value: c.id, label: c.nome }))} style={{ marginBottom: 0 }} />
          </div>
        </Card>
      </div>

      {/* Tabela */}
      <Card style={{ padding: 4 }}>
        <Table columns={columns} data={lista} emptyState={
          <EmptyState icon={isReceita ? '💰' : '🧾'} title={`Nenhuma ${isReceita ? 'receita' : 'despesa'} no período`}
            sub="Adicione seu primeiro lançamento para começar." action={<Btn onClick={novo} icon="+">Nova {isReceita ? 'receita' : 'despesa'}</Btn>} />
        } />
      </Card>

      {/* Modal form */}
      {modal && form && (
        <Modal title={`${form._edit ? 'Editar' : 'Nova'} ${isReceita ? 'receita' : 'despesa'}`} onClose={() => { setModal(false); setForm(null) }}
          footer={<div style={{ display: 'flex', gap: 10, padding: 16 }}>
            <Btn full variant="ghost" onClick={() => { setModal(false); setForm(null) }}>Cancelar</Btn>
            <Btn full onClick={salvar}>Salvar</Btn>
          </div>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Data" type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} style={{ marginBottom: 0 }} />
            <Input label="Valor (R$)" type="text" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0,00" style={{ marginBottom: 0 }} />
          </div>
          <Select label="Categoria" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
            options={cats.map(c => ({ value: c.id, label: `${c.icon || ''} ${c.nome}`.trim() }))} />
          <Input label="Descrição" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Opcional" />
          <Select label="Conta" value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
            placeholder={accounts.length ? 'Selecione' : 'Cadastre uma conta em Contas'}
            options={accounts.map(a => ({ value: a.id, label: a.nome }))} />
          {!isReceita && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Select label="Forma de pagamento" value={form.forma} onChange={e => setForm(f => ({ ...f, forma: e.target.value }))} options={FORMAS_PAGAMENTO_PF} style={{ marginBottom: 0 }} />
              <Select label="Recorrência" value={form.recorrencia} onChange={e => setForm(f => ({ ...f, recorrencia: e.target.value }))} options={RECORRENCIAS_PF} style={{ marginBottom: 0 }} />
            </div>
          )}
          <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} options={statusOptions} />
          <Input label="Anexo (link, opcional)" value={form.anexoUrl} onChange={e => setForm(f => ({ ...f, anexoUrl: e.target.value }))} placeholder="https://..." />
        </Modal>
      )}
    </div>
  )
}
