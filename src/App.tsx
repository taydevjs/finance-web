import { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, PlusCircle, Trash2, X } from 'lucide-react';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  category: string;
  createdAt: string;
}

export function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'deposit' | 'withdraw'>('deposit');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const api = axios.create({
  baseURL: 'https://finance-api-ixfk.onrender.com',
});

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  function formatDate(dateString: string) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
  }

  async function loadTransactions() {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  async function handleCreateTransaction(e: FormEvent) {
    e.preventDefault();

    if (!title || !amount || !category) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    // Trata valores digitados como "1.014", "1014" ou "1.014,50"
    const cleanedAmount = amount.replace(/\./g, '').replace(',', '.');
    const numericAmount = Number(cleanedAmount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Insira um valor numérico válido e maior que zero.');
      return;
    }

    try {
      await api.post('/transactions', {
        title,
        amount: numericAmount,
        category,
        type,
      });

      setTitle('');
      setAmount('');
      setCategory('');
      setType('deposit');
      loadTransactions();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao cadastrar transação:', error);
      alert('Erro ao cadastrar transação.');
    }
  }

  async function handleDeleteTransaction(id: string) {
    try {
      await api.delete(`/transactions/${id}`);
      loadTransactions();
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      alert('Erro ao deletar transação.');
    }
  }

  const summary = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'deposit') {
        acc.deposits += transaction.amount;
        acc.total += transaction.amount;
      } else {
        acc.withdraws += transaction.amount;
        acc.total -= transaction.amount;
      }
      return acc;
    },
    { deposits: 0, withdraws: 0, total: 0 }
  );

  return (
    <div style={{ backgroundColor: '#121214', minHeight: '100vh', color: '#a8a8b3', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* HEADER */}
      <header style={{ backgroundColor: '#202024', borderBottom: '1px solid #29292e', padding: '1.5rem 0' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'rgba(51, 204, 149, 0.1)', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
              <DollarSign color="#33cc95" size={28} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f0f2f5', margin: 0 }}>
              Finanças<span style={{ color: '#33cc95' }}>Pro</span>
            </h1>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: '#33cc95',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(51, 204, 149, 0.2)'
            }}
          >
            <PlusCircle size={20} />
            Nova Transação
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ maxWidth: '1120px', margin: '2rem auto 0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
        {/* CARDS DE RESUMO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {/* Entradas */}
          <div style={{ backgroundColor: '#202024', padding: '2rem', borderRadius: '12px', border: '1px solid #29292e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ color: '#f0f2f5', fontWeight: '500' }}>Entradas</span>
              <ArrowUpCircle color="#33cc95" size={32} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#33cc95', margin: 0 }}>
              {formatCurrency(summary.deposits)}
            </h2>
          </div>

          {/* Saídas */}
          <div style={{ backgroundColor: '#202024', padding: '2rem', borderRadius: '12px', border: '1px solid #29292e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ color: '#f0f2f5', fontWeight: '500' }}>Saídas</span>
              <ArrowDownCircle color="#e52e4d" size={32} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e52e4d', margin: 0 }}>
              {formatCurrency(summary.withdraws)}
            </h2>
          </div>

          {/* Saldo Total */}
          <div style={{ backgroundColor: '#33cc95', padding: '2rem', borderRadius: '12px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: '500' }}>Saldo Total</span>
              <DollarSign color="#fff" size={32} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {formatCurrency(summary.total)}
            </h2>
          </div>
        </div>

        {/* TABELA DE TRANSAÇÕES */}
        <div style={{ backgroundColor: '#202024', borderRadius: '12px', border: '1px solid #29292e', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #29292e', color: '#969cb3', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1.25rem 1.5rem' }}>Título</th>
                <th style={{ padding: '1.25rem 1.5rem' }}>Valor</th>
                <th style={{ padding: '1.25rem 1.5rem' }}>Categoria</th>
                <th style={{ padding: '1.25rem 1.5rem' }}>Data</th>
                <th style={{ padding: '1.25rem 1.5rem' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #29292e' }}>
                  <td style={{ padding: '1.25rem 1.5rem', color: '#f0f2f5', fontWeight: '500' }}>{t.title}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 'bold', fontSize: '1.1rem', color: t.type === 'deposit' ? '#33cc95' : '#e52e4d' }}>
                    {t.type === 'withdraw' && '- '}{formatCurrency(t.amount)}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ backgroundColor: '#121214', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', color: '#a8a8b3' }}>
                      {t.category}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: '#737380' }}>{formatDate(t.createdAt)}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <button
                      onClick={() => handleDeleteTransaction(t.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px' }}
                      title="Excluir"
                    >
                      <Trash2 color="#e52e4d" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#737380' }}>
              Nenhuma transação cadastrada ainda.
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#202024', width: '100%', maxWidth: '500px', borderRadius: '12px', padding: '2.5rem', border: '1px solid #29292e', position: 'relative' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#737380', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <h2 style={{ color: '#f0f2f5', fontSize: '1.75rem', marginBottom: '2rem', fontWeight: 'bold' }}>Nova Transação</h2>

            <form onSubmit={handleCreateTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Título (Ex: Mercado, Salário)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '1rem', backgroundColor: '#121214', border: '1px solid #29292e', borderRadius: '8px', color: '#f0f2f5', outline: 'none', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                placeholder="Valor (Ex: 1014 ou 1014,50)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '1rem', backgroundColor: '#121214', border: '1px solid #29292e', borderRadius: '8px', color: '#f0f2f5', outline: 'none', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                placeholder="Categoria (Ex: Alimentação, Trabalho)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '1rem', backgroundColor: '#121214', border: '1px solid #29292e', borderRadius: '8px', color: '#f0f2f5', outline: 'none', boxSizing: 'border-box' }}
              />

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setType('deposit')}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: '8px',
                    border: type === 'deposit' ? '2px solid #33cc95' : '1px solid #29292e',
                    backgroundColor: type === 'deposit' ? 'rgba(51, 204, 149, 0.1)' : '#121214',
                    color: type === 'deposit' ? '#33cc95' : '#a8a8b3',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <ArrowUpCircle size={20} />
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setType('withdraw')}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: '8px',
                    border: type === 'withdraw' ? '2px solid #e52e4d' : '1px solid #29292e',
                    backgroundColor: type === 'withdraw' ? 'rgba(229, 46, 77, 0.1)' : '#121214',
                    color: type === 'withdraw' ? '#e52e4d' : '#a8a8b3',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <ArrowDownCircle size={20} />
                  Saída
                </button>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: '#33cc95',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;