import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Briefcase, Building, GraduationCap, Users, Globe } from 'lucide-react';
import Input from '../ui/Input';

const Step3Professional = () => {
    const { register, watch, formState: { errors } } = useFormContext();
    const type = watch('type');

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                    {type === 'PF' ? 'Dados Profissionais' : 'Dados da Empresa'}
                </h2>
                <p className="text-gray-500 text-sm">
                    {type === 'PF' ? 'Conte um pouco sobre sua carreira.' : 'Detalhes sobre a organização.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {type === 'PF' ? (
                    <>
                        <div className="md:col-span-2">
                            <Input
                                label="Formação Acadêmica"
                                placeholder="Ex: Engenharia Civil"
                                icon={GraduationCap}
                                {...register('education')}
                            />
                        </div>

                        <Input
                            label="Registro Profissional (CREA/CAU)"
                            placeholder="Número do Registro"
                            {...register('professionalRegistry')}
                        />

                        <Input
                            label="Empresa Atual"
                            icon={Building}
                            {...register('currentCompany')}
                        />

                        <div className="md:col-span-2">
                            <Input
                                label="Área de Atuação"
                                placeholder="Ex: Gerente de Projetos"
                                icon={Briefcase}
                                {...register('jobRole')}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="md:col-span-2">
                            <Input
                                label="Ramo de Atividade"
                                placeholder="Ex: Consultoria em Engenharia"
                                icon={Briefcase}
                                {...register('activityBranch')}
                            />
                        </div>

                        <Input
                            label="Número de Funcionários"
                            type="number"
                            placeholder="0"
                            icon={Users}
                            {...register('employeeCount')}
                        />

                        <Input
                            label="Site da Empresa"
                            placeholder="https://www.suaempresa.com.br"
                            icon={Globe}
                            {...register('website')}
                            error={errors.website}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Step3Professional;
