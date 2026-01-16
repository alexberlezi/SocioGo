import React from 'react';
import { ChevronRight, User, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PendingMemberCard = ({ member }) => {
    const navigate = useNavigate();
    const { profile } = member;

    if (!profile) return null;

    const isPF = profile.type === 'PF';
    const mainName = isPF ? profile.fullName : profile.socialReason;
    const subInfo = isPF ? (profile.education || profile.jobRole || 'Profissional') : (profile.fantasyName || 'Empresa');

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
                                {profile.docPartnerPhoto ? (
                                    <img
                                        src={`http://localhost:3000/${profile.docPartnerPhoto}`}
                                        alt={mainName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-gray-300 dark:text-gray-600">
                                        <User className="w-10 h-10" />
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
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1 text-sm text-gray-500 dark:text-gray-400 font-bold">
                            {isPF ? <GraduationCap className="w-4 h-4 text-blue-500" /> : <Briefcase className="w-4 h-4 text-blue-500" />}
                            <span className="line-clamp-1">{subInfo}</span>
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
