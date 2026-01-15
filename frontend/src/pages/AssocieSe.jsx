import React from 'react';
import Card from '../components/ui/Card';
import MultiStepForm from '../components/MultiStepForm';

const AssocieSe = () => {
    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">

                    <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl mb-4 relative z-10 no-underline decoration-0 drop-shadow-sm">
                        Associe-se ao SocioGo
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-gray-600">
                        Junte-se a nós e aproveite todos os benefícios exclusivos em poucos passos.
                    </p>
                </div>

                <Card>
                    <MultiStepForm />
                </Card>

                <p className="text-center text-gray-400 text-sm mt-8">
                    &copy; 2026 SocioGo. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
};

export default AssocieSe;
