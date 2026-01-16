import React, { useState, useEffect } from 'react';
import {
    Plus,
    Tag,
    Edit2,
    Trash2,
    X,
    Check,
    ArrowUpRight,
    ArrowDownRight,
    Palette
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const Categories = () => {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        color: '#3b82f6',
        type: 'IN'
    });

    useEffect(() => {
        fetchCategories();

        // Listen for tenant changes and auto-refresh
        const handleTenantChange = () => {
            setLoading(true);
            fetchCategories();
        };
        window.addEventListener('tenantChanged', handleTenantChange);
        return () => window.removeEventListener('tenantChanged', handleTenantChange);
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Erro ao carregar categorias');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingCategory
            ? `http://localhost:3000/api/categories/${editingCategory.id}`
            : 'http://localhost:3000/api/categories';

        const method = editingCategory ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success(editingCategory ? 'Categoria atualizada!' : 'Categoria criada!');
                setIsModalOpen(false);
                setEditingCategory(null);
                setFormData({ name: '', color: '#3b82f6', type: 'IN' });
                fetchCategories();
            } else {
                const err = await response.json();
                toast.error(err.error || 'Erro ao salvar categoria');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Erro de conexão');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

        try {
            const response = await fetch(`http://localhost:3000/api/categories/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success('Categoria excluída!');
                fetchCategories();
            } else {
                const err = await response.json();
                toast.error(err.error || 'Erro ao excluir categoria');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Erro de conexão');
        }
    };

    const openEdit = (cat) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, color: cat.color, type: cat.type });
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8 w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Categorias Financeiras</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Gerencie as categorias de entradas e saídas do sistema.</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCategory(null);
                            setFormData({ name: '', color: '#3b82f6', type: 'IN' });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Nova Categoria</span>
                    </button>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                                    <Tag className="w-6 h-6" />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(cat)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight truncate mb-2">{cat.name}</h3>

                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cat.type === 'IN' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                                    {cat.type === 'IN' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {cat.type === 'IN' ? 'Entrada' : 'Saída'}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                    {cat.color}
                                </div>
                            </div>
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <div className="col-span-full py-20 bg-gray-50/50 dark:bg-slate-800/20 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-gray-400">
                            <Tag className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-black uppercase tracking-widest text-sm">Nenhuma categoria cadastrada</p>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

                        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-slate-800">
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                                </h1>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'IN' })}
                                        className={`flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest ${formData.type === 'IN' ? 'bg-green-50 border-green-500 text-green-600' : 'bg-transparent border-gray-100 dark:border-slate-800 text-gray-400'}`}
                                    >
                                        <ArrowUpRight className="w-4 h-4" />
                                        Entrada
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'OUT' })}
                                        className={`flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest ${formData.type === 'OUT' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-transparent border-gray-100 dark:border-slate-800 text-gray-400'}`}
                                    >
                                        <ArrowDownRight className="w-4 h-4" />
                                        Saída
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome da Categoria</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full mt-1 px-5 py-3.5 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-blue-600 transition-all"
                                            placeholder="Ex: Marketing, Aluguel, Eventos..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Cor de Identificação</label>
                                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl">
                                            <input
                                                type="color"
                                                value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                className="w-12 h-12 bg-transparent border-none cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={formData.color}
                                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                    className="w-full bg-transparent border-none text-sm font-mono font-bold text-gray-500 p-0 focus:ring-0"
                                                />
                                            </div>
                                            <Palette className="w-5 h-5 text-gray-300" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Categories;
