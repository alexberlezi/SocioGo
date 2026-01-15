import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User, Building, UserCircle, CreditCard, Calendar, Phone, Briefcase } from 'lucide-react';
import Input from '../ui/Input';

const Step1Identity = () => {
    const { register, watch, setValue, formState: { errors } } = useFormContext();
    const type = watch('type');

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Identificação</h2>
                <p className="text-gray-500 text-sm">Escolha o tipo de cadastro e preencha seus dados principais.</p>
            </div>

            {/* Type Toggle */}
            <div className="flex justify-center mb-10">
                <div className="bg-gray-100/80 p-1.5 rounded-2xl inline-flex shadow-inner border border-gray-200/50 backdrop-blur-sm">
                    <button
                        type="button"
                        onClick={() => setValue('type', 'PF')}
                        className={`flex items-center space-x-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ease-out ${type === 'PF'
                            ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10 transform scale-100 border border-gray-100 ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        <span>Pessoa Física</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setValue('type', 'PJ')}
                        className={`flex items-center space-x-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ease-out ${type === 'PJ'
                            ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10 transform scale-100 border border-gray-100 ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <Building className="w-4 h-4" />
                        <span>Pessoa Jurídica</span>
                    </button>
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <Input
                        label="E-mail"
                        placeholder="seu@email.com"
                        type="email"
                        {...register('email')}
                        error={errors.email}
                    // Manual icon just for email since it is custom in previous code, 
                    // but our new Input supports 'icon' prop. Let's make an Email icon or just use text @
                    // Actually let's use a Lucide Mail icon or AtSign
                    />
                </div>

                {type === 'PF' ? (
                    <>
                        <div className="col-span-1 md:col-span-2">
                            <Input
                                label="Nome Completo"
                                placeholder="Nome completo"
                                icon={UserCircle}
                                {...register('fullName')}
                                error={errors.fullName}
                            />
                        </div>

                        <Input
                            label="CPF"
                            placeholder="000.000.000-00"
                            icon={CreditCard}
                            {...register('cpf')}
                            error={errors.cpf}
                        />

                        <Input
                            label="Data de Nascimento"
                            type="date"
                            icon={Calendar}
                            {...register('birthDate')}
                            error={errors.birthDate}
                        />

                        <Input
                            label="Telefone"
                            placeholder="(00) 00000-0000"
                            icon={Phone}
                            {...register('phone')}
                            error={errors.phone}
                        />
                    </>
                ) : (
                    <>
                        <div className="col-span-1 md:col-span-2">
                            <Input
                                label="Razão Social"
                                placeholder="Razão Social da Empresa"
                                icon={Building}
                                {...register('socialReason')}
                                error={errors.socialReason}
                            />
                        </div>

                        <Input
                            label="Nome Fantasia"
                            placeholder="Nome Fantasia"
                            {...register('fantasyName')}
                        />

                        <Input
                            label="CNPJ"
                            placeholder="00.000.000/0000-00"
                            icon={CreditCard}
                            {...register('cnpj')}
                            error={errors.cnpj}
                        />

                        <Input
                            label="Inscrição Estadual"
                            placeholder="Isento se não houver"
                            {...register('stateRegistration')}
                        />

                        <Input
                            label="Nome do Responsável"
                            placeholder="Nome do Sócio/Diretor"
                            icon={User}
                            {...register('responsibleName')}
                            error={errors.responsibleName}
                        />

                        <Input
                            label="CPF do Responsável"
                            placeholder="000.000.000-00"
                            icon={CreditCard}
                            {...register('responsibleCpf')}
                            error={errors.responsibleCpf}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Step1Identity;
