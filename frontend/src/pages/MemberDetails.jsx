import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import MemberApprovalCard from '../components/MemberApprovalCard';
import { ArrowLeft } from 'lucide-react';

const MemberDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Since we don't have a specific get-by-id pending route, we can fetch all and find
        // OR ideally we should create a get-by-id route. For now, let's reuse the pending list logic 
        // effectively simulating a find.
        // NOTE: In production, create GET /api/admin/members/:id
        const fetchMember = async () => {
            try {
                // Fetching all pending for now as per current backend capability
                const response = await fetch('http://localhost:3000/api/admin/pending-members');
                if (response.ok) {
                    const data = await response.json();
                    const found = data.find(m => m.id === parseInt(id));
                    setMember(found);
                }
            } catch (error) {
                console.error('Error fetching member:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMember();
    }, [id]);

    const handleApprove = async (memberId) => {
        if (!window.confirm('Tem certeza que deseja aprovar este cadastro?')) return;
        try {
            const response = await fetch(`http://localhost:3000/api/admin/approve-member/${memberId}`, {
                method: 'PATCH'
            });
            if (response.ok) {
                alert('Membro aprovado com sucesso!');
                navigate('/admin');
            } else {
                alert('Erro ao aprovar membro.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleReject = async (memberId, reason) => {
        if (!reason) {
            alert('Por favor, informe um motivo.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3000/api/admin/reject-member/${memberId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            if (response.ok) {
                alert('Membro recusado com sucesso!');
                navigate('/admin');
            } else {
                alert('Erro ao recusar membro.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (loading) return (
        <AdminLayout>
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        </AdminLayout>
    );

    if (!member) return (
        <AdminLayout>
            <div className="text-center py-20">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Membro não encontrado</h3>
                <button onClick={() => navigate('/admin')} className="text-blue-600 mt-4 hover:underline">Voltar para lista</button>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-bold">Voltar para Fila</span>
                </button>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detalhes da Solicitação</h1>
                </div>
            </div>

            <MemberApprovalCard
                member={member}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </AdminLayout >
    );
};

export default MemberDetails;
