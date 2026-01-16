
export const FEATURES = {
    SITE: {
        key: 'SITE',
        label: 'Site Institucional',
        description: 'Portal público para notícias, transparência e captação de sócios.'
    },
    PORTAL_SOCIO: {
        key: 'PORTAL_SOCIO',
        label: 'Portal do Sócio',
        description: 'Área privada para membros com autoatendimento e documentos.'
    },
    PORTAL_FINANCEIRO: {
        key: 'PORTAL_FINANCEIRO',
        label: 'Portal: Financeiro',
        description: 'Permite ao sócio ver débitos e gerar 2ª via de boletos.'
    },
    PORTAL_VOTACOES: {
        key: 'PORTAL_VOTACOES',
        label: 'Portal: Votações',
        description: 'Habilita assembleias virtuais, enquetes e pesquisas.'
    },
    COMUNICACAO: {
        key: 'COMUNICACAO',
        label: 'Comunicação',
        description: 'Gestão de notícias, enquetes e comunicados para sócios.'
    },
    ACESSOS: {
        key: 'ACESSOS',
        label: 'Gestão de Acessos',
        description: 'Aprovação de sócios, gestão de membros e perfis de acesso.'
    },
    FINANCEIRO_ADM: {
        key: 'FINANCEIRO_ADM',
        label: 'Módulo Financeiro (Adm)',
        description: 'Gestão de fluxo de caixa, categorias e balancetes em PDF.'
    },
    AUDITORIA: {
        key: 'AUDITORIA',
        label: 'Auditoria e Logs',
        description: 'Trilha de segurança completa registrando todas as ações do sistema.'
    },
    EVENTOS: {
        key: 'EVENTOS',
        label: 'Eventos',
        description: 'Gestão de eventos, calendário e inscrições para sócios.'
    },
    COMUNICACAO_ZAP: {
        key: 'COMUNICACAO_ZAP',
        label: 'Comunicação WhatsApp',
        description: 'Integração para envio de alertas automáticos e cobranças.'
    }
};

export const FEATURE_GROUPS = {
    CANAIS: [FEATURES.SITE, FEATURES.PORTAL_SOCIO],
    PORTAL: [FEATURES.PORTAL_FINANCEIRO, FEATURES.PORTAL_VOTACOES],
    FERRAMENTAS: [FEATURES.COMUNICACAO, FEATURES.ACESSOS, FEATURES.FINANCEIRO_ADM, FEATURES.EVENTOS, FEATURES.AUDITORIA, FEATURES.COMUNICACAO_ZAP]
};
