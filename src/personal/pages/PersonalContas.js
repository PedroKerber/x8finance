import { useState, useMemo } from 'react'
import { T, fmt, uid, errMsgAcao } from '../../theme'
import { Card, Btn, Modal, Input, Select, Toast, Confirm, EmptyState } from '../../components/ui'
import { TIPOS_CONTA_PF, tipoContaLabel } from '../../personalData'

export default function PersonalContas({ accounts, onSaveAccount, onDeleteAccount }) {
  const [modal, setModal] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState(null)

  const saldoTotal = useMemo(() => accounts.reduce((s, a) => s + (a.saldoAtual || 0), 0), [accounts])

  const novo = () => { setForm({ id: uid(), nome: '', banco: '', tipo: 'corrente', saldoInicial: '', saldoAtual: '', obs: '', _edit: false }); setModal(true) }
  const editar = (a) => { setForm({ ...a, saldoInicial: String(a.saldoInicial ?? ''), saldoAtual: String(a.saldoAtual ?? ''), _edit: true }); setModal(true) }

  const salvar = async () => {
    if (!form.nome.trim()) { setToast({ msg: 'Informe o nome da conta.', type: 'error' }); return }
    const acc = {
      ...form, nome: form.nome.trim(),
      saldoInicial: parseFloat(String(form.saldoInicial).replace(',', '.')) || 0,
      saldoAtual: parseFloat(String(form.saldoAtual).replace(',', '.')) || 0,
    }
    delete acc._edit
    try {
      await onSaveAccount(acc, form._edit)
      setModal(false); setForm(null)
      setToast({ msg: form._edit ? 'Conta atualizada!' : 'Conta cadastrada!', type: 'success' })
    } catch (e) { setToast({ msg: errMsgAcao(e), type: 'error' }) }
  }

  const excluir = async () => {
    try { await onDeleteAccount(confirmId); setToast({ msg: 'Conta excluída.', type: 'success' }) }
    catch (e) { setToast({ msg: errMsgAcao(e), type: 'error' }) }
    setConfirmId(null)
  }

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      {confirmId && <Confirm msg="Excluir esta conta? Lançamentos ligados a ela ficam sem conta." onYes={excluir} onNo={() => setConfirmId(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 26, margin: 0, color: T.text }}>Contas</h1>
          <div style={{ color: T.sub, fontSize: 14, marginTop: 2 }}>Suas contas bancárias, carteiras e investimentos.</div>
        </div>
        <Btn onClick={novo} icon="+">Nova conta</Btn>
      </div>

      <Card style={{ padding: '16px 22px', marginBottom: 18, display: 'inline-block' }}>
        <div style={{ fontSize: 12, color: T.sub }}>Saldo total</div>
        <div style={{ fontWeight: 800, fontSize: 26, color: saldoTotal >= 0 ? T.green : T.red, marginTop: 4 }}>{fmt(saldoTotal)}</div>
      </Card>

      {accounts.length === 0 ? (
        <Card style={{ padding: 0 }}>
          <EmptyState icon="🏦" title="Nenhuma conta cadastrada" sub="Cadastre uma conta para organizar seus lançamentos."
            action={<Btn onClick={novo} icon="+">Nova conta</Btn>} />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {accounts.map(a => (
            <Card key={a.id} style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{a.banco || '—'} · {tipoContaLabel(a.tipo)}</div>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: T.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏦</div>
              </div>
              <div style={{ fontSize: 12, color: T.sub }}>Saldo atual</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: (a.saldoAtual || 0) >= 0 ? T.green : T.red, marginBottom: 12 }}>{fmt(a.saldoAtual)}</div>
              {a.obs && <div style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>{a.obs}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn sm full variant="ghost" onClick={() => editar(a)}>Editar</Btn>
                <Btn sm full variant="ghost" onClick={() => setConfirmId(a.id)} style={{ color: T.red, borderColor: T.red }}>Excluir</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && form && (
        <Modal title={`${form._edit ? 'Editar' : 'Nova'} conta`} onClose={() => { setModal(false); setForm(null) }}
          footer={<div style={{ display: 'flex', gap: 10, padding: 16 }}>
            <Btn full variant="ghost" onClick={() => { setModal(false); setForm(null) }}>Cancelar</Btn>
            <Btn full onClick={salvar}>Salvar</Btn>
          </div>}>
          <Input label="Nome da conta" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex.: Nubank" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Banco" value={form.banco} onChange={e => setForm(f => ({ ...f, banco: e.target.value }))} placeholder="Opcional" style={{ marginBottom: 0 }} />
            <Select label="Tipo" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
              options={TIPOS_CONTA_PF.map(t => ({ value: t.id, label: t.label }))} style={{ marginBottom: 0 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Saldo inicial (R$)" type="text" value={form.saldoInicial} onChange={e => setForm(f => ({ ...f, saldoInicial: e.target.value }))} placeholder="0,00" style={{ marginBottom: 0 }} />
            <Input label="Saldo atual (R$)" type="text" value={form.saldoAtual} onChange={e => setForm(f => ({ ...f, saldoAtual: e.target.value }))} placeholder="0,00" style={{ marginBottom: 0 }} />
          </div>
          <Input label="Observações" value={form.obs} onChange={e => setForm(f => ({ ...f, obs: e.target.value }))} placeholder="Opcional" />
        </Modal>
      )}
    </div>
  )
}
