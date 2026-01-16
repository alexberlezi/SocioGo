import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Building2, Phone, Mail, Globe, CheckCircle, XCircle, Pencil, Trash2, AlertTriangle, Moon, Sun, Users, Activity } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { toast } from 'react-hot-toast';

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState(null);

    // Form State
    const initialFormState = {
        id: null,
        name: '',
        cnpj: '',
        status: 'ACTIVE',
        logoLight: '',
        logoDark: '',
        primaryColor: '#2563eb', // Default Blue
        logoLightFile: null,
        logoDarkFile: null,
        zipCode: '',
        street: '',
        number: '',
        district: '',
        city: '',
        state: '',
        whatsapp: '',
        email: ''
    };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/companies');
            if (res.ok) {
                const data = await res.json();
                setCompanies(data);
            }
        } catch (error) {
            toast.error('Erro ao carregar associações');
        } finally {
            setLoading(false);
        }
    };

    // Masks & Validation
    const formatCNPJ = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .slice(0, 18);
    };

    const handleCepBlur = async () => {
        const cep = formData.zipCode.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        street: data.logradouro,
                        district: data.bairro,
                        city: data.localidade,
                        state: data.uf
                    }));
                } else {
                    toast.error('CEP não encontrado');
                }
            } catch (err) {
                toast.error('Erro ao buscar CEP');
            }
        }
    };

    const handleImageUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    [type]: reader.result,
                    [type + 'File']: file
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Nome é obrigatório';
        if (!formData.cnpj) newErrors.cnpj = 'CNPJ é obrigatório';
        if (formData.cnpj && formData.cnpj.length < 18) newErrors.cnpj = 'CNPJ incompleto';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Verifique os campos obrigatórios');
            return;
        }

        try {
            const data = new FormData();
            data.append('userId', currentUser?.id);
            data.append('name', formData.name);
            data.append('cnpj', formData.cnpj);
            data.append('status', formData.status);
            data.append('primaryColor', formData.primaryColor);
            data.append('zipCode', formData.zipCode);
            data.append('street', formData.street);
            data.append('number', formData.number);
            data.append('district', formData.district);
            data.append('city', formData.city);
            data.append('state', formData.state);
            data.append('whatsapp', formData.whatsapp);
            data.append('email', formData.email);

            if (formData.logoLightFile) data.append('logoLight', formData.logoLightFile);
            if (formData.logoDarkFile) data.append('logoDark', formData.logoDarkFile);

            const isEdit = !!formData.id;
            const url = isEdit ? `http://localhost:3000/api/companies/${formData.id}` : 'http://localhost:3000/api/companies';

            const res = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                body: data
            });

            if (res.ok) {
                toast.success(`Associação ${isEdit ? 'atualizada' : 'cadastrada'} com sucesso!`);
                setIsModalOpen(false);
                fetchCompanies();
                setFormData(initialFormState);
                setErrors({});
            } else {
                const err = await res.json();
                toast.error(err.error || 'Erro ao salvar');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        }
    };

    const handleEdit = (company) => {
        setFormData({
            id: company.id,
            name: company.name,
            cnpj: company.cnpj || '',
            status: company.status,
            logoLight: company.logoLight,
            logoDark: company.logoDark,
            primaryColor: company.primaryColor || '#2563eb',
            logoLightFile: null,
            logoDarkFile: null,
            zipCode: company.zipCode || '',
            street: company.street || '',
            number: company.number || '',
            district: company.district || '',
            city: company.city || '',
            state: company.state || '',
            whatsapp: company.whatsapp || '',
            email: company.email || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!companyToDelete) return;
        try {
            const res = await fetch(`http://localhost:3000/api/companies/${companyToDelete.id}?userId=${currentUser?.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Associação removida com sucesso!');
                fetchCompanies();
                setCompanyToDelete(null);
            } else {
                toast.error('Erro ao remover associação');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        const config = {
            ACTIVE: { label: 'Ativa', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
            INACTIVE: { label: 'Inativa', color: 'bg-slate-100 text-slate-500' },
            TEST: { label: 'Teste', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
            DEFAULTER: { label: 'Inadimplente', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
        };
        const cfg = config[status] || config.ACTIVE;
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
                {cfg.label}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8 w-full px-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-slate-800">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-purple-600" />
                            Gestão de Associações
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
                            Administração de métricas, branding e dados cadastrais das unidades.
                        </p>
                    </div>
                    <button
                        onClick={() => { setFormData(initialFormState); setIsModalOpen(true); }}
                        className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Associação
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCompanies.map(company => (
                        <div key={company.id} className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl hover:border-purple-500/30 transition-all relative overflow-hidden">
                            {/* Accent Line */}
                            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: company.primaryColor || '#2563eb' }}></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 relative">
                                    {company.logoLight || company.logoDark ? (
                                        <img src={company.logoLight || company.logoDark} alt={company.name} className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <Building2 className="w-8 h-8 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {getStatusBadge(company.status)}
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(company)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setCompanyToDelete(company)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate" title={company.name}>
                                {company.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 mb-4">
                                <MapPin className="w-3 h-3" />
                                {company.city}/{company.state}
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center">
                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                                    <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase flex items-center justify-center gap-1">
                                        <Activity className="w-3 h-3" /> Sócios Ativos
                                    </span>
                                    <span className="block text-lg font-black text-emerald-700 dark:text-emerald-400">
                                        {company.activeMembers || 0}
                                    </span>
                                </div>
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                    <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase flex items-center justify-center gap-1">
                                        <Users className="w-3 h-3" /> Usuários
                                    </span>
                                    <span className="block text-lg font-black text-blue-700 dark:text-blue-400">
                                        {company.totalUsers || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Footer Info */}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                                <span className="font-mono">{company.cnpj || 'Sem CNPJ'}</span>
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {company.whatsapp || '--'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 my-8">
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-3xl">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-purple-600" />
                                {formData.id ? 'Editar Associação' : 'Nova Associação'}
                            </h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Branding */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-purple-500" /> Branding & Identidade
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Sun className="w-3 h-3" /> Tema Claro</p>
                                        <label className="block w-full aspect-video rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all overflow-hidden relative bg-white">
                                            {formData.logoLight ? (
                                                <img src={formData.logoLight} className="h-full object-contain p-4" alt="Light Logo" />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <Sun className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                    <span className="text-xs font-bold text-slate-400">Upload Logo Claro</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logoLight')} />
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Moon className="w-3 h-3" /> Tema Escuro</p>
                                        <label className="block w-full aspect-video rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all overflow-hidden relative bg-slate-900">
                                            {formData.logoDark ? (
                                                <img src={formData.logoDark} className="h-full object-contain p-4" alt="Dark Logo" />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <Moon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                                    <span className="text-xs font-bold text-slate-500">Upload Logo Escuro</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logoDark')} />
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cor Primária da Marca</label>
                                        <div className="flex gap-2 items-center h-full">
                                            <input title="Escolha a cor da marca" type="color" value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} className="w-12 h-12 p-1 rounded-xl cursor-pointer bg-transparent border border-slate-200" />
                                            <div className="flex-1">
                                                <input type="text" value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none uppercase font-mono text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome da Associação *</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={`w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl outline-none focus:border-purple-500 dark:text-white transition-colors`} />
                                        {errors.name && <span className="text-xs text-red-500 font-bold">{errors.name}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CNPJ *</label>
                                        <input required type="text" value={formData.cnpj} onChange={e => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })} className={`w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border ${errors.cnpj ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl outline-none focus:border-purple-500 dark:text-white transition-colors`} maxLength={18} />
                                        {errors.cnpj && <span className="text-xs text-red-500 font-bold">{errors.cnpj}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status Inicial</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-purple-500 dark:text-white">
                                            <option value="ACTIVE">Ativa</option>
                                            <option value="TEST">Em Teste</option>
                                            <option value="INACTIVE">Inativa</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-purple-500" /> Endereço
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CEP</label>
                                        <input type="text" value={formData.zipCode} onChange={e => setFormData({ ...formData, zipCode: e.target.value })} onBlur={handleCepBlur} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-purple-500 dark:text-white" placeholder="00000-000" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logradouro</label>
                                        <input type="text" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-purple-500 dark:text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Número</label>
                                        <input type="text" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-purple-500 dark:text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bairro</label>
                                        <input type="text" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-purple-500 dark:text-white" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cidade</label>
                                        <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-purple-500 dark:text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">UF</label>
                                        <input type="text" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-purple-500 dark:text-white" maxLength={2} />
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-purple-500" /> Contato
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">WhatsApp</label>
                                        <input type="text" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-purple-500 dark:text-white" placeholder="(00) 00000-0000" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">E-mail</label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-purple-500 dark:text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-3xl">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="h-10 px-6 rounded-lg font-bold text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="h-10 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-purple-500/20"
                            >
                                {formData.id ? 'Atualizar Associação' : 'Salvar Associação'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {
                companyToDelete && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-red-100 dark:border-red-900 overflow-hidden transform transition-all scale-100">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Excluir Associação?</h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    Tem certeza que deseja remover <strong>{companyToDelete.name}</strong>?
                                    <br />
                                    <span className="text-red-500 font-bold text-xs mt-2 block">
                                        ⚠️ Isso afetará todos os usuários e dados vinculados.
                                    </span>
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setCompanyToDelete(null)}
                                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all"
                                    >
                                        Sim, Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </AdminLayout >
    );
};

export default CompanyManagement;
