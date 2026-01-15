import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MapPin, Search } from 'lucide-react';
import Input from '../ui/Input';

const Step2Address = () => {
    const { register, setValue, formState: { errors } } = useFormContext();
    const [loadingCep, setLoadingCep] = useState(false);

    const handleBlurCep = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            setLoadingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setValue('street', data.logradouro);
                    setValue('district', data.bairro);
                    setValue('city', data.localidade);
                    setValue('state', data.uf);
                    // Focus number field ideally
                }
            } catch (error) {
                console.error("Erro ao buscar CEP", error);
            } finally {
                setLoadingCep(false);
            }
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Endereço</h2>
                <p className="text-gray-500 text-sm">Onde podemos te encontrar?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <Input
                        label="CEP"
                        placeholder="00000-000"
                        maxLength={9}
                        {...register('zipCode')}
                        onBlur={handleBlurCep}
                        error={errors.zipCode}
                        className={loadingCep ? 'opacity-50' : ''}
                    />
                    {loadingCep && <div className="text-xs text-blue-500 mt-1 animate-pulse font-medium">Buscando...</div>}
                </div>

                <div className="md:col-span-3">
                    <Input
                        label="Logradouro"
                        placeholder="Rua, Avenida, etc"
                        {...register('street')}
                        error={errors.street}
                    />
                </div>

                <div className="md:col-span-1">
                    <Input
                        label="Número"
                        placeholder="Nº"
                        {...register('number')}
                        error={errors.number}
                    />
                </div>

                <div className="md:col-span-2">
                    <Input
                        label="Complemento"
                        placeholder="Apto, Bloco, Sala"
                        {...register('complement')}
                    />
                </div>

                <div className="md:col-span-1">
                    <Input
                        label="Bairro"
                        {...register('district')}
                        error={errors.district}
                    />
                </div>

                <div className="md:col-span-3">
                    <Input
                        label="Cidade"
                        {...register('city')}
                        error={errors.city}
                    />
                </div>

                <div className="md:col-span-1">
                    <Input
                        label="Estado (UF)"
                        maxLength={2}
                        {...register('state')}
                        error={errors.state}
                    />
                </div>
            </div>
        </div>
    );
};

export default Step2Address;
