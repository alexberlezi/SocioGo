import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, User } from 'lucide-react';
import Input from '../ui/Input';

const Step4Dependents = () => {
    const { register, control, formState: { errors } } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "dependents"
    });

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Dependentes</h2>
                <p className="text-gray-500 text-sm">Adicione seus dependentes (Cônjuge ou Filhos) para inclusão nos benefícios.</p>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all relative group animate-slideIn">
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="absolute top-4 right-4 text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 mb-4 text-sm font-bold text-blue-600 uppercase tracking-wider">
                            <User className="w-4 h-4" />
                            <span>Dependente {index + 1}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <Input
                                    label="Nome Completo"
                                    placeholder="Nome do dependente"
                                    {...register(`dependents.${index}.name`)}
                                    error={errors.dependents?.[index]?.name}
                                />
                            </div>

                            <div className="md:col-span-1 space-y-1">
                                <label className="block text-sm font-medium text-gray-700 ml-1">Parentesco</label>
                                <select
                                    {...register(`dependents.${index}.kinship`)}
                                    className="block w-full rounded-xl border-gray-200 bg-gray-50/50 text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white p-3 transition-all appearance-none"
                                >
                                    <option value="CONJUGE">Cônjuge (Esposa/Marido)</option>
                                    <option value="FILHO">Filho(a)</option>
                                </select>
                            </div>

                            <div className="md:col-span-1">
                                <Input
                                    label="Data de Nascimento"
                                    type="date"
                                    {...register(`dependents.${index}.birthDate`)}
                                    error={errors.dependents?.[index]?.birthDate}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {fields.length === 0 && (
                    <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-dashed border-2 border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                            <User className="w-8 h-8 text-blue-400 group-hover:text-blue-500" />
                        </div>
                        <h4 className="text-gray-900 font-medium">Nenhum dependente</h4>
                        <p className="text-sm text-gray-500">Adicione familiares para estender seus benefícios.</p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => append({ name: '', kinship: 'CONJUGE', birthDate: '' })}
                    className="w-full py-4 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Adicionar Dependente
                </button>
            </div>
        </div>
    );
};

export default Step4Dependents;
