import React, { useState } from 'react';
import { Vote, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PortalVoting = () => {
    // Mock Polls
    const [polls, setPolls] = useState([
        {
            id: 1,
            title: "Aprovação das Contas 2024",
            description: "Votação para aprovar o relatório financeiro do ano anterior.",
            deadline: "20/01/2026",
            status: "OPEN",
            options: ["Aprovar", "Rejeitar", "Abster-se"],
            userVote: null
        },
        {
            id: 2,
            title: "Eleição Diretoria 2026-2028",
            description: "Escolha da chapa para o próximo biênio.",
            deadline: "01/02/2026",
            status: "OPEN",
            options: ["Chapa 1 - Renovação", "Chapa 2 - Continuidade"],
            userVote: null
        }
    ]);

    const handleVote = (pollId, option) => {
        // Here would be the API call to register vote
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1000)),
            {
                loading: 'Registrando voto criptografado...',
                success: 'Voto registrado com sucesso!',
                error: 'Erro ao votar.'
            }
        ).then(() => {
            setPolls(prev => prev.map(p =>
                p.id === pollId ? { ...p, userVote: option } : p
            ));
        });
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Assembleia Digital</h1>
                <p className="text-slate-500 text-sm">Participe das decisões importantes da associação.</p>
            </header>

            <div className="space-y-4">
                {polls.map((poll) => (
                    <div key={poll.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${poll.status === 'OPEN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'}`}>
                                    {poll.status === 'OPEN' ? 'VOTAÇÃO ABERTA' : 'ENCERRADA'}
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{poll.title}</h3>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                                <p className="flex items-center justify-end gap-1">
                                    <Clock className="w-3 h-3" />
                                    Até {poll.deadline}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{poll.description}</p>

                        <div className="space-y-3">
                            {poll.options.map((option) => (
                                <label
                                    key={option}
                                    className={`
                                        flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                                        ${poll.userVote === option
                                            ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500'
                                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                        ${poll.userVote && poll.userVote !== option ? 'opacity-50 pointer-events-none' : ''}
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name={`poll-${poll.id}`}
                                        disabled={!!poll.userVote}
                                        checked={poll.userVote === option}
                                        onChange={() => handleVote(poll.id, option)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className={`text-sm font-bold ${poll.userVote === option ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {option}
                                    </span>
                                    {poll.userVote === option && <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PortalVoting;
