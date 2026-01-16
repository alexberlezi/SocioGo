import React, { useState } from 'react';
import { ChevronRight, User, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PendingMemberCard = ({ member }) => {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const { profile } = member;

    if (!profile) return null;

    const isPF = profile.type === 'PF';
    const mainName = isPF ? profile.fullName : profile.socialReason;
    const subInfo = isPF ? (profile.jobRole || profile.education || 'Profissional') : (profile.fantasyName || 'Empresa');

    return (
        <div className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">

            {/* Banner Blue */}
            <div className="h-32 bg-blue-600 w-full relative shrink-0">
                {/* Status Badge - Yellow - Top Right */}
                <div className="absolute top-4 right-5">
                    <span className="inline-flex items-center px-3 py-1 bg-yellow-400 text-yellow-950 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm">
                        Pendente
                    </span>
                </div>
            </div>

            <div className="px-3 sm:px-5 pb-4 sm:pb-5 flex-1 flex flex-col min-h-0">
                {/* Header Row: Overlapping Avatar + Zone-aligned Text */}
                <div className="flex flex-row items-center gap-1.5 sm:gap-6 -mt-8 sm:-mt-16 md:-mt-20 mb-3 sm:mb-6 relative z-10 w-full h-16 sm:h-32 md:h-40">

                    {/* Responsive Avatar Container */}
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-white p-1 sm:p-2 rounded-lg sm:rounded-3xl shadow-lg transform -rotate-1 hover:rotate-0 transition-all duration-300">
                            <div className="w-full h-full bg-gray-100 dark:bg-slate-800 rounded-md sm:rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100 dark:border-slate-700">
                                {profile.docPartnerPhoto && !imageError ? (
                                    <img
                                        src={profile.docPartnerPhoto.startsWith('http') ? profile.docPartnerPhoto : `http://localhost:3000/${profile.docPartnerPhoto}`}
                                        alt={mainName}
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                        <span className="text-xl sm:text-4xl md:text-5xl font-black uppercase">
                                            {mainName?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Zone-aligned Text Container */}
                    <div className="flex-1 flex flex-col h-full text-left min-w-0">
                        {/* Upper Half: Name in Blue Area */}
                        <div className="flex-1 flex items-center pb-0.5 sm:pb-2">
                            <h3 className="text-[10px] sm:text-lg md:text-2xl font-black text-white leading-[1.1] uppercase line-clamp-2 drop-shadow-sm" title={mainName}>
                                {mainName}
                            </h3>
                        </div>

                        {/* Lower Half: Formation in Dark Area */}
                        <div className="flex-1 flex items-center pt-0.5 sm:pt-2">
                            <div className="flex items-center gap-1 sm:gap-1.5 text-[8.5px] sm:text-sm md:text-base font-bold text-gray-500 dark:text-blue-300 w-full min-w-0">
                                <div className="shrink-0">
                                    {isPF ? (
                                        profile.jobRole ? <Briefcase className="w-2 h-2 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-500" /> : <GraduationCap className="w-2 h-2 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-500" />
                                    ) : (
                                        <Briefcase className="w-2 h-2 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-500" />
                                    )}
                                </div>
                                <span className="line-clamp-1">{subInfo}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Action Button */}
                <div className="mt-auto pt-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/approvals/${member.id}`);
                        }}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-blue-200 dark:shadow-none shadow-lg"
                    >
                        <span>Analisar</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingMemberCard;
