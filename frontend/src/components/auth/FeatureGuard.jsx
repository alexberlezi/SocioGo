import React, { useEffect, useState } from 'react';
import { Lock, Smartphone } from 'lucide-react';
import { FEATURES } from '../../config/features.config';

// Simple in-memory cache to avoid fetching on every render if not using Context yet
let featuresCache = null;

export const useFeatures = () => {
    const [features, setFeatures] = useState(featuresCache || {});
    const [loading, setLoading] = useState(!featuresCache);

    useEffect(() => {
        if (featuresCache) return;

        fetch('http://localhost:3000/api/saas/features')
            .then(res => res.json())
            .then(data => {
                featuresCache = data;
                setFeatures(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load features", err);
                setLoading(false);
            });
    }, []);

    // Also listen for updates if necessary, but simple fetch is fine for now
    return { features, loading };
};

export const hasModule = (featureKey, featuresList) => {
    if (!featuresList) return false;
    // Default to true if not found to avoid lockouts during transition, or false?
    // Based on user request: "Esconder instantaneamente". So default false if missing in DB but defined in config.
    // However, our backend defaults are set.
    return featuresList[featureKey] === true;
};

const FeatureGuard = ({ feature, children, fallback = null }) => {
    const { features, loading } = useFeatures();

    if (loading) return null; // Or skeleton

    if (!features[feature]) {
        if (fallback) return fallback;

        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-white/10 relative z-10">
                        <Lock className="w-8 h-8 text-blue-400" />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight relative z-10">
                        Upgrade Necessário
                    </h2>

                    <p className="text-slate-400 mb-8 font-medium leading-relaxed relative z-10">
                        O módulo <span className="text-blue-400 font-bold">{FEATURES[feature]?.label || feature}</span> não está incluso no seu plano atual.
                    </p>

                    <a
                        href="https://wa.me/5511999999999?text=Olá, gostaria de fazer upgrade no SocioGo para habilitar o módulo "
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 group relative z-10"
                    >
                        <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Falar com Consultor
                    </a>

                    <button
                        onClick={() => window.history.back()}
                        className="mt-6 text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors relative z-10"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default FeatureGuard;
