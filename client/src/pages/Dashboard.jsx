import { useState, useEffect } from 'react';
import { LogOut, ArrowUpCircle, ArrowDownCircle, DollarSign, PlusCircle, Trash2, Filter } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import api from '../services/api';

export default function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('income');
    const [loading, setLoading] = useState(true); const [monthlyLimit, setMonthlyLimit] = useState(2000);
    const [isEditingLimit, setIsEditingLimit] = useState(false);
    const [tempLimit, setTempLimit] = useState('2000');

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const user = JSON.parse(localStorage.getItem('@FinanceFlow:user') || '{}');

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/transactions', {
                params: { month, year }
            });
            setTransactions(response.data);
        } catch (err) {
            console.error('Erro ao buscar transações', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [month, year]);

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!description || !amount) return;

        const apiType = type === 'income' ? 'INCOME' : 'EXPENSE';

        try {
            const response = await api.post('/transactions', {
                description,
                amount: Number(amount),
                type: apiType,
                categoryId: "4666aaaa-6370-4682-94dd-bd519a28d622"
            });

            const transDate = new Date(response.data.date || response.data.createdAt);
            if (transDate.getMonth() + 1 === Number(month) && transDate.getFullYear() === Number(year)) {
                setTransactions([response.data, ...transactions]);
            } else {
                alert("Transação adicionada! Ela pertence a outro mês/ano selecionado no filtro.");
            }

            setDescription('');
            setAmount('');
        } catch (err) {
            console.error('Erro ao adicionar transação', err);
        }
    };

    const handleDeleteTransaction = async (id) => {
        try {
            await api.delete(`/transactions/${id}`);
            setTransactions(transactions.filter(t => t.id !== id && t._id !== id));
        } catch (err) {
            console.error('Erro ao deletar transação', err);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    const income = transactions
        .filter(t => t.type && t.type.trim().toUpperCase() === 'INCOME')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const expense = transactions
        .filter(t => t.type && t.type.trim().toUpperCase() === 'EXPENSE')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const total = income - expense;

    const percentUsed = monthlyLimit > 0 ? Math.min((expense / monthlyLimit) * 100, 100) : 0;

    const getProgressBarColor = () => {
        if (expense >= monthlyLimit) return 'bg-red-500';
        if (percentUsed >= 80) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const chartData = [
        { name: 'Receitas', value: income, color: '#10b981' },
        { name: 'Despesas', value: expense, color: '#ef4444' }
    ].filter(item => item.value > 0);

    return (
        <div className="min-h-screen bg-slate-50">

            <nav className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-slate-900">
                    Moneta<span className="text-emerald-500">Finance</span>
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600 font-medium">Olá, {user.name}</span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors font-medium cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" /> Sair
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 space-y-6">

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                        <Filter className="h-4 w-4 text-emerald-500" />
                        Filtrar Período
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select
                            value={month}
                            onChange={e => setMonth(Number(e.target.value))}
                            className="border border-slate-200 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 sm:flex-initial"
                        >
                            <option value="1">Janeiro</option>
                            <option value="2">Fevereiro</option>
                            <option value="3">Março</option>
                            <option value="4">Abril</option>
                            <option value="5">Maio</option>
                            <option value="6">Junho</option>
                            <option value="7">Julho</option>
                            <option value="8">Agosto</option>
                            <option value="9">Setembro</option>
                            <option value="10">Outubro</option>
                            <option value="11">Novembro</option>
                            <option value="12">Dezembro</option>
                        </select>

                        <select
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                            className="border border-slate-200 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Receitas</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">R$ {income.toFixed(2)}</h3>
                        </div>
                        <ArrowUpCircle className="h-10 w-10 text-emerald-500" />
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Despesas</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">R$ {expense.toFixed(2)}</h3>
                        </div>
                        <ArrowDownCircle className="h-10 w-10 text-red-500" />
                    </div>

                    <div className={`p-6 rounded-2xl border shadow-sm flex items-center justify-between transition-colors ${total >= 0 ? 'bg-emerald-500 border-transparent text-white' : 'bg-red-500 border-transparent text-white'}`}>
                        <div>
                            <p className="text-sm opacity-90 font-medium">Saldo Atual</p>
                            <h3 className="text-2xl font-bold mt-1">R$ {total.toFixed(2)}</h3>
                        </div>
                        <DollarSign className="h-10 w-10 opacity-80" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Teto de Gastos Mensal</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Você já gastou R$ {expense.toFixed(2)} do seu limite estabelecido.</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {isEditingLimit ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={tempLimit}
                                        onChange={e => setTempLimit(e.target.value)}
                                        className="w-24 border border-slate-200 rounded-lg p-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                    <button
                                        onClick={() => { setMonthlyLimit(Number(tempLimit) || 0); setIsEditingLimit(false); }}
                                        className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-lg font-medium cursor-pointer"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setTempLimit(monthlyLimit.toString()); setIsEditingLimit(true); }}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                    Definir Limite (R$ {monthlyLimit.toFixed(0)})
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${getProgressBarColor()}`}
                            style={{ width: `${percentUsed}%` }}
                        />
                    </div>

                    <div className="flex justify-between text-xs font-medium">
                        <span className={expense >= monthlyLimit ? 'text-red-500 font-bold' : percentUsed >= 80 ? 'text-amber-500 font-bold' : 'text-slate-500'}>
                            {expense >= monthlyLimit ? '⚠️ Limite Estourado!' : percentUsed >= 80 ? '🔥 Cuidado! Próximo do limite.' : '✅ Orçamento seguro'}
                        </span>
                        <span className="text-slate-400">{percentUsed.toFixed(0)}% utilizado</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">Nova Transação</h3>
                        <form onSubmit={handleAddTransaction} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Salário, Mercado..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Valor (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0,00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Tipo</label>
                                <select
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="income">Receita (+)</option>
                                    <option value="expense">Despesa (-)</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <PlusCircle className="h-4 w-4" /> Adicionar
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 space-y-6">

                        {chartData.length > 0 && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
                                <h4 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Distribuição Mensal</h4>
                                <div className="h-[180px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                                            <Legend verticalAlign="bottom" height={32} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                            <h3 className="text-lg font-bold text-slate-900">Histórico de Transações</h3>

                            {loading ? (
                                <p className="text-slate-400 text-sm py-4 text-center animate-pulse">Atualizando histórico...</p>
                            ) : transactions.length === 0 ? (
                                <p className="text-slate-500 text-sm py-4 text-center">Nenhuma movimentação neste período.</p>
                            ) : (
                                <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                                    {transactions.map(t => {
                                        const isIncome = t.type && t.type.trim().toUpperCase() === 'INCOME';
                                        return (
                                            <div key={t.id || t._id} className="flex items-center justify-between py-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">{t.description}</p>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(t.date || t.createdAt).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-sm font-bold ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {isIncome ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteTransaction(t.id || t._id)}
                                                        className="text-slate-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}