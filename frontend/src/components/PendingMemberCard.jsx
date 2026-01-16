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
            <div className="h-28 bg-blue-600 w-full relative shrink-0">
                {/* Status Badge - Yellow - Top Right */}
                <div className="absolute top-4 right-5">
                    <span className="inline-flex items-center px-3 py-1 bg-yellow-400 text-yellow-950 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm">
                        Pendente
                    </span>
                </div>
            </div>

            <div className="px-6 pb-6 flex-1 flex flex-col">
                {/* Header Section with Overlapping Avatar */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 mb-4 relative z-10 w-full">

                    {/* Square Avatar Container */}
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-white p-1.5 rounded-2xl shadow-md">
                            <div className="w-full h-full bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 dark:border-slate-700">
                                {profile.docPartnerPhoto && !imageError ? (
                                    <img
                                        src={profile.docPartnerPhoto.startsWith('http') ? profile.docPartnerPhoto : `http://localhost:3000/${profile.docPartnerPhoto}`}
                                        alt={mainName}
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                        <span className="text-3xl font-black uppercase">
                                            {mainName?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Name & Formation */}
                    <div className="flex-1 text-center sm:text-left mb-2 sm:mb-0 pt-2 sm:pt-0">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight uppercase line-clamp-2" title={mainName}>
                            {mainName}
                        </h3>
                        <div className="flex items-start justify-center sm:justify-start gap-1.5 mt-2 text-sm text-gray-500 dark:text-gray-400 font-bold">
                            <div className="mt-0.5 min-w-[16px]">
                                {isPF ? (
                                    profile.jobRole ? <Briefcase className="w-4 h-4 text-blue-500" /> : <GraduationCap className="w-4 h-4 text-blue-500" />
                                ) : (
                                    <Briefcase className="w-4 h-4 text-blue-500" />
                                )}
                            </div>
                            <span className="leading-tight text-left">{subInfo}</span>
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
