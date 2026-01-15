import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../schemas/registerSchema';
import { ChevronRight, ChevronLeft, Check, Users, Building } from 'lucide-react';
import Step1Identity from './steps/Step1Identity';
import Step2Address from './steps/Step2Address';
import Step3Professional from './steps/Step3Professional';
import Step4Dependents from './steps/Step4Dependents';
import Step5Documents from './steps/Step5Documents';
import Step6Review from './steps/Step6Review';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const steps = [
    { id: 1, title: 'Identificação' },
    { id: 2, title: 'Endereço' },
    { id: 3, title: 'Profissional' },
    { id: 4, title: 'Dependentes' },
    { id: 5, title: 'Documentos' },
    { id: 6, title: 'Revisão' },
];

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const SuccessView = ({ onReset }) => (
    <div className="text-center py-16 animate-fadeIn">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Cadastro Realizado!</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
            Seu cadastro foi enviado com sucesso. Você receberá um e-mail com as instruções para os próximos passos.
        </p>
        <button
            onClick={onReset}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition duration-200 shadow-lg shadow-blue-500/30"
        >
            Realizar Novo Cadastro
        </button>
    </div>
);

const MultiStepForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const methods = useForm({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
        defaultValues: {
            type: 'PF',
            dependents: [],
            isPublicConsent: false,
            termsAccepted: false,
            lgpdAccepted: false
        }
    });

    const { watch, trigger, handleSubmit, getValues, reset } = methods;
    const userType = watch('type');

    // Filter steps based on User Type (PF has Step 4, PJ skips it)
    const filteredSteps = steps.filter(step => {
        if (userType === 'PJ' && step.id === 4) return false;
        return true;
    });

    const isLastStep = currentStep === filteredSteps.length;
    const stepIndex = currentStep - 1;
    const currentStepId = filteredSteps[stepIndex]?.id;

    const nextStep = async () => {
        let fieldsToValidate = [];

        // Define validation fields per step
        switch (currentStepId) {
            case 1:
                fieldsToValidate = userType === 'PF'
                    ? ['type', 'email', 'fullName', 'cpf', 'birthDate', 'phone']
                    : ['type', 'email', 'socialReason', 'cnpj', 'responsibleName', 'responsibleCpf'];
                break;
            case 2:
                fieldsToValidate = ['zipCode', 'street', 'number', 'district', 'city', 'state'];
                break;
            case 3:
                // Optional fields mostly, but good to trigger just in case
                break;
            case 4:
                fieldsToValidate = ['dependents'];
                break;
            case 5:
                // File validation if strict
                break;
            case 6:
                fieldsToValidate = ['termsAccepted', 'lgpdAccepted'];
                break;
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleReset = () => {
        setIsSuccess(false);
        setCurrentStep(1);
        reset();
        window.scrollTo(0, 0);
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // Create FormData for file upload
            const formData = new FormData();

            // Append all text fields
            Object.keys(data).forEach(key => {
                if (key === 'dependents') {
                    formData.append(key, JSON.stringify(data[key]));
                } else if (key.startsWith('doc')) {
                    // Files handled separately usually, but here they might be in data if we set them
                    // We will handle file inputs by directly appending from the file input refs or state if stored in react-hook-form
                    // Assuming react-hook-form 'doc...' fields contain FileList or File
                    if (data[key] && data[key][0]) {
                        formData.append(key, data[key][0]);
                    }
                } else {
                    if (data[key] !== undefined && data[key] !== null) {
                        formData.append(key, data[key]);
                    }
                }
            });

            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setIsSuccess(true);
                window.scrollTo(0, 0);
            } else {
                const err = await response.json();
                alert('Erro ao cadastrar: ' + (err.error || err.message));
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao servidor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (currentStepId) {
            case 1: return <Step1Identity />;
            case 2: return <Step2Address />;
            case 3: return <Step3Professional />;
            case 4: return <Step4Dependents />;
            case 5: return <Step5Documents />;
            case 6: return <Step6Review />;
            default: return null;
        }
    };

    if (isSuccess) {
        return <SuccessView onReset={handleReset} />;
    }

    return (
        <div className="w-full">
            {/* Progress Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 relative">
                <div className="flex items-start justify-between max-w-2xl mx-auto relative">
                    {filteredSteps.map((step, index) => {
                        const isCompleted = index < stepIndex;
                        const isCurrent = index === stepIndex;

                        return (
                            <div key={step.id} className="flex flex-col items-center relative z-10 group">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2",
                                        isCompleted ? "bg-green-500 border-green-500 text-white" :
                                            isCurrent ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110" :
                                                "bg-white border-gray-300 text-gray-400 group-hover:border-gray-400"
                                    )}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                                </div>
                                <span className={cn(
                                    "mt-3 text-xs font-medium whitespace-nowrap transition-colors duration-300",
                                    isCurrent ? "text-blue-700" : "text-gray-400"
                                )}>
                                    {step.title}
                                </span>

                                {/* Connector Line */}
                                {index !== filteredSteps.length - 1 && (
                                    <div className={cn(
                                        "absolute top-5 left-1/2 w-full h-[2px] -z-10",
                                        // This is tricky for responsive spacing, usually simpler to separate logic
                                        // Just hiding for now or implementing fixed width logic
                                    )} />
                                )}
                            </div>
                        );
                    })}

                    {/* Progress Bar Background (Simplified) */}
                    <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200 -z-0 hidden md:block max-w-2xl mx-auto right-0" />
                </div>
                {/* Progress Value for mobile */}
                <div className="mt-6 md:hidden">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300 ease-out"
                            style={{ width: `${(currentStep / filteredSteps.length) * 100}%` }}
                        />
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">Etapa {currentStep} de {filteredSteps.length}</p>
                </div>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
                    <div className="min-h-[400px]">
                        {renderStep()}
                    </div>

                    <div className="mt-8 flex justify-between pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1 || isSubmitting}
                            className={cn(
                                "flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                currentStep === 1
                                    ? "opacity-0 pointer-events-none"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
                            )}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </button>

                        {!isLastStep ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center px-8 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Próximo
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={cn(
                                    "flex items-center px-8 py-2.5 rounded-lg text-sm font-bold text-white shadow-lg transition-all duration-200",
                                    isSubmitting
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/30 transform hover:-translate-y-0.5"
                                )}
                            >
                                {isSubmitting ? 'Enviando...' : 'Finalizar Cadastro'}
                                {!isSubmitting && <Check className="w-4 h-4 ml-2" />}
                            </button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};

export default MultiStepForm;
