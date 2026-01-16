import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Smartphone, AlertTriangle } from 'lucide-react';
import { FEATURES } from '../../config/features.config';
import { toast } from 'react-hot-toast';

// Context for Features with global state management
const FeaturesContext = createContext({
    features: {},
    loading: true,
    revalidate: () => { },
    clearCache: () => { }
});

export const FeaturesProvider = ({ children }) => {
    const [features, setFeatures] = useState({});
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const fetchFeatures = useCallback(async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const companyId = user?.associationId;

            console.log('[FeatureGuard] User:', user);
            console.log('[FeatureGuard] AssociationId:', companyId);

            const url = companyId
                ? `http://localhost:3000/api/saas/check-permissions?companyId=${companyId}`
                : 'http://localhost:3000/api/saas/features';

            console.log('[FeatureGuard] Fetching from:', url);

            const res = await fetch(url);

            if (res.status === 403) {
                // Association inactive or permission denied
                const data = await res.json();
                toast.error(data.error || 'Acesso ao módulo negado');
                // Redirect to dashboard
                navigate('/admin');
                return;
            }

            if (res.ok) {
                const data = await res.json();
                console.log('[FeatureGuard] Features received:', data);
                setFeatures(data.features || data);
            }
        } catch (err) {
            console.error("[FeatureGuard] Failed to load features", err);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Revalidate on mount and route change
    useEffect(() => {
        fetchFeatures();
    }, [location.pathname, fetchFeatures]);

    const clearCache = useCallback(() => {
        setFeatures({});
        setLoading(true);
    }, []);

    return (
        <FeaturesContext.Provider value={{ features, loading, revalidate: fetchFeatures, clearCache }}>
            {children}
        </FeaturesContext.Provider>
    );
};

export const useFeatures = () => {
    return useContext(FeaturesContext);
};

export const hasModule = (featureKey, featuresList) => {
    if (!featuresList) return false;
    return featuresList[featureKey] === true;
};

// API Interceptor Hook - Call this at App level
export const usePermissionInterceptor = () => {
    const { clearCache } = useFeatures();
    const navigate = useNavigate();

    const handleApiResponse = useCallback(async (response) => {
        if (response.status === 403) {
            try {
                const data = await response.clone().json();
                if (data.error?.includes('módulo') || data.error?.includes('Módulo')) {
                    // Module not contracted
                    toast.error('Este módulo não está mais disponível no seu plano');
                    clearCache();
                    navigate('/admin');
                    return false;
                }
            } catch (e) {
                // Not JSON, ignore
            }
        }
        return true;
    }, [clearCache, navigate]);

    return { handleApiResponse };
};

const FeatureGuard = ({ feature, children, fallback = null }) => {
    const { features, loading, revalidate } = useFeatures();
    const navigate = useNavigate();
    const [accessDenied, setAccessDenied] = useState(false);

    // Revalidate on mount
    useEffect(() => {
        revalidate();
    }, []);

    // Real-time check when features update
    useEffect(() => {
        if (!loading && features && feature) {
            if (features[feature] === false) {
                setAccessDenied(true);
            } else {
                setAccessDenied(false);
            }
        }
    }, [features, feature, loading]);

    if (loading) return null;

    if (!features[feature] || accessDenied) {
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
                        Módulo Indisponível
                    </h2>

                    <p className="text-slate-400 mb-8 font-medium leading-relaxed relative z-10">
                        O módulo <span className="text-blue-400 font-bold">{FEATURES[feature]?.label || feature}</span> não está incluso no seu plano atual ou foi desativado.
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
                        onClick={() => navigate('/admin')}
                        className="mt-6 text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors relative z-10"
                    >
                        Voltar ao Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default FeatureGuard;
