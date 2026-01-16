import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { ArrowLeft, Save, User, MapPin, Briefcase, Users, Camera, Mail, Phone, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper Components defined outside to prevent re-renders losing focus
const TabButton = ({ id, label, activeTab, setActiveTab, icon: Icon }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === id
            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

const InputGroup = ({ label, value, onChange, disabled = false, type = 'text', placeholder = '' }) => (
    <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {label}
        </label>
        <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        />
    </div>
);

const EditMemberProfile = ({ isReadOnly = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    const [member, setMember] = useState({
        email: '',
        status: '',
        profile: {
            fullName: '', socialReason: '', type: 'PF', cpf: '', cnpj: '',
            phone: '', birthDate: '',
            zipCode: '', street: '', number: '', complement: '', district: '', city: '', state: '',
            education: '', jobRole: '', currentCompany: '',
            activityBranch: '', website: '',
            bio: '',
            docPartnerPhoto: ''
        }
    });

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/members/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setMember(prev => ({
                        ...prev,
                        ...data,
                        profile: { ...prev.profile, ...data.profile }
                    }));
                } else {
                    toast.error('Membro não encontrado.');
                    navigate('/admin/members');
                }
            } catch (error) {
                console.error('Error fetching member:', error);
                toast.error('Erro ao carregar dados do membro.');
            } finally {
                setLoading(false);
            }
        };
        fetchMember();
    }, [id, navigate]);

    const handleChange = (section, field, value) => {
        if (section === 'user') {
            setMember(prev => ({ ...prev, [field]: value }));
        } else if (section === 'profile') {
            setMember(prev => ({
                ...prev,
                profile: { ...prev.profile, [field]: value }
            }));
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error('Apenas arquivos JPG e PNG são permitidos.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB
            toast.error('O arquivo deve ter no máximo 2MB.');
            return;
        }

        // Local Preview
        const previewUrl = URL.createObjectURL(file);
        setMember(prev => ({
            ...prev,
            profile: { ...prev.profile, docPartnerPhoto: previewUrl }
        }));

        // Upload Logic
        const formData = new FormData();
        formData.append('photo', file);

        const uploadPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/members/${id}/photo`, {
                    method: 'PATCH',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    resolve(result);
                    setMember(prev => ({
                        ...prev,
                        profile: { ...prev.profile, docPartnerPhoto: result.photoUrl }
                    }));
                } else {
                    reject(result.details || result.error || 'Erro desconhecido');
                }
            } catch (error) {
                reject('Erro de conexão ao enviar foto.');
            }
        });

        await toast.promise(uploadPromise, {
            loading: 'Enviando foto...',
            success: 'Foto atualizada com sucesso!',
            error: (err) => `Erro ao enviar foto: ${err}`
        });
    };

    const handleSave = async () => {
        setSaving(true);

        const savePromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/members/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(member)
                });

                const result = await response.json();

                if (response.ok) {
                    resolve(result);
                } else {
                    reject(result.details || result.error || 'Erro desconhecido');
                }
            } catch (error) {
                reject('Erro de conexão ao servidor.');
            }
        });

        await toast.promise(savePromise, {
            loading: 'Salvando alterações...',
            success: 'Alterações salvas com sucesso!',
            error: (err) => `Erro ao salvar: ${err}`,
        });

        setSaving(false);
    };

    if (loading) return (
        <AdminLayout>
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        </AdminLayout>
    );

    const isPF = member.profile.type === 'PF';

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/members')}
                        className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Cadastro</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Atualize as informações do associado.</p>
                    </div>
                </div>

                {!isReadOnly && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-70"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        <span>Salvar Alterações</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar - Profile Summary */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden relative transition-colors pb-6">
                        {/* Blue Header Background */}
                        <div className="h-32 w-full bg-blue-600 absolute top-0 left-0 z-0"></div>

                        {/* Profile Picture */}
                        <div className="relative z-10 mt-8 mb-3 flex justify-center">
                            <div className="w-36 h-36 rounded-2xl bg-white p-1.5 shadow-xl mx-auto relative group">
                                <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-800 flex items-center justify-center border border-gray-100 dark:border-slate-700">
                                    {member.profile.docPartnerPhoto ? (
                                        <img src={member.profile.docPartnerPhoto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-gray-300" />
                                    )}
                                </div>
                                {!isReadOnly && (
                                    <>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/png, image/jpeg"
                                            onChange={handlePhotoChange}
                                        />
                                        <button
                                            onClick={() => fileInputRef.current.click()}
                                            className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all transform hover:scale-110"
                                            title="Alterar foto"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Name & Status */}
                        <div className="px-6 w-full flex flex-col items-center z-10 relative">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1 leading-snug uppercase tracking-tight text-center">
                                {isPF ? member.profile.fullName : member.profile.socialReason}
                            </h2>

                            <span className={`inline-flex items-center px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-3 border ${member.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200' :
                                member.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    'bg-gray-100 text-gray-700 border-gray-200'
                                }`}>
                                {member.status === 'APPROVED' ? 'Ativo' : member.status === 'PENDING' ? 'Pendente' : member.status}
                            </span>

                            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-semibold mb-6 w-full">
                                <Briefcase className="w-3 h-3" />
                                <span className="truncate max-w-[240px]">{isPF ? (member.profile.jobRole || 'Profissão não informada') : 'Empresa'}</span>
                            </div>

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent mb-6"></div>

                            {/* Contact Details */}
                            <div className="w-full space-y-3">
                                <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-blue-500 mr-3 shadow-sm">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate" title={member.email}>{member.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-green-500 mr-3 shadow-sm">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Telefone</p>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{member.profile.phone || '—'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-purple-500 mr-3 shadow-sm">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Localização</p>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                                            {member.profile.city ? `${member.profile.city}/${member.profile.state}` : '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Form */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px]">
                        {/* Tabs Header */}
                        <div className="flex border-b border-gray-100 dark:border-slate-800 overflow-x-auto">
                            <TabButton id="personal" label={isPF ? "Dados Pessoais" : "Dados da Empresa"} icon={User} activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton id="address" label="Endereço" icon={MapPin} activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton id="professional" label="Profissional" icon={Briefcase} activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton id="dependents" label="Dependentes" icon={Users} activeTab={activeTab} setActiveTab={setActiveTab} />
                        </div>

                        {/* Tab Content */}
                        <div className="p-8">
                            {activeTab === 'personal' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                    <InputGroup
                                        label={isPF ? "Nome Completo" : "Razão Social"}
                                        value={isPF ? member.profile.fullName : member.profile.socialReason}
                                        onChange={(v) => handleChange('profile', isPF ? 'fullName' : 'socialReason', v)}
                                        disabled={isReadOnly}
                                    />
                                    {!isPF && (
                                        <InputGroup
                                            label="Nome Fantasia"
                                            value={member.profile.fantasyName}
                                            onChange={(v) => handleChange('profile', 'fantasyName', v)}
                                            disabled={isReadOnly}
                                        />
                                    )}
                                    <InputGroup
                                        label={isPF ? "CPF" : "CNPJ"}
                                        value={isPF ? member.profile.cpf : member.profile.cnpj}
                                        onChange={(v) => handleChange('profile', isPF ? 'cpf' : 'cnpj', v)}
                                        disabled={isReadOnly}
                                    />
                                    {isPF && (
                                        <InputGroup
                                            label="Data de Nascimento"
                                            type="date"
                                            value={member.profile.birthDate ? member.profile.birthDate.split('T')[0] : ''}
                                            onChange={(v) => handleChange('profile', 'birthDate', v)}
                                            disabled={isReadOnly}
                                        />
                                    )}
                                    <InputGroup
                                        label="Telefone / WhatsApp"
                                        value={member.profile.phone}
                                        onChange={(v) => handleChange('profile', 'phone', v)}
                                        disabled={isReadOnly}
                                    />
                                    <InputGroup
                                        label="E-mail de Acesso"
                                        value={member.email}
                                        onChange={(v) => handleChange('user', 'email', v)}
                                        disabled={isReadOnly}
                                    />
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
                                            Biografia / Notas
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={member.profile.bio || ''}
                                            onChange={(e) => handleChange('profile', 'bio', e.target.value)}
                                            disabled={isReadOnly}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:border-blue-500 outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'address' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                    <InputGroup label="CEP" value={member.profile.zipCode} onChange={(v) => handleChange('profile', 'zipCode', v)} disabled={isReadOnly} />
                                    <div className="hidden md:block"></div> {/* Spacer */}
                                    <div className="md:col-span-2">
                                        <InputGroup label="Logradouro" value={member.profile.street} onChange={(v) => handleChange('profile', 'street', v)} disabled={isReadOnly} />
                                    </div>
                                    <InputGroup label="Número" value={member.profile.number} onChange={(v) => handleChange('profile', 'number', v)} disabled={isReadOnly} />
                                    <InputGroup label="Complemento" value={member.profile.complement} onChange={(v) => handleChange('profile', 'complement', v)} disabled={isReadOnly} />
                                    <InputGroup label="Bairro" value={member.profile.district} onChange={(v) => handleChange('profile', 'district', v)} disabled={isReadOnly} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Cidade" value={member.profile.city} onChange={(v) => handleChange('profile', 'city', v)} disabled={isReadOnly} />
                                        <InputGroup label="Estado (UF)" value={member.profile.state} onChange={(v) => handleChange('profile', 'state', v)} disabled={isReadOnly} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'professional' && isPF && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                    <InputGroup label="Profissão / Cargo" value={member.profile.jobRole} onChange={(v) => handleChange('profile', 'jobRole', v)} disabled={isReadOnly} />
                                    <InputGroup label="Empresa Atual" value={member.profile.currentCompany} onChange={(v) => handleChange('profile', 'currentCompany', v)} disabled={isReadOnly} />
                                    <InputGroup label="Formação Acadêmica" value={member.profile.education} onChange={(v) => handleChange('profile', 'education', v)} disabled={isReadOnly} />
                                    <InputGroup label="Registro Profissional (CREA/OAB...)" value={member.profile.professionalRegistry} onChange={(v) => handleChange('profile', 'professionalRegistry', v)} disabled={isReadOnly} />
                                </div>
                            )}

                            {activeTab === 'professional' && !isPF && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                    <InputGroup label="Ramo de Atividade" value={member.profile.activityBranch} onChange={(v) => handleChange('profile', 'activityBranch', v)} disabled={isReadOnly} />
                                    <InputGroup label="Site da Empresa" value={member.profile.website} onChange={(v) => handleChange('profile', 'website', v)} disabled={isReadOnly} />
                                    <InputGroup label="Inscrição Estadual" value={member.profile.stateRegistration} onChange={(v) => handleChange('profile', 'stateRegistration', v)} disabled={isReadOnly} />
                                </div>
                            )}

                            {activeTab === 'dependents' && (
                                <div className="animate-fadeIn text-center py-10">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-gray-900 dark:text-white font-bold">Gestão de Dependentes</h3>
                                    <p className="text-gray-500 mb-6">Funcionalidade de adição/remoção de dependentes em breve.</p>
                                    {/* Placeholder for potential future list mapping */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default EditMemberProfile;
