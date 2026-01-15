import { z } from 'zod';

// Helper for empty strings to optional
const emptyToUndefined = (val) => (val === "" ? undefined : val);

export const registerSchema = z.object({
    // Step 1: Identity
    type: z.enum(['PF', 'PJ']),
    email: z.string().email("E-mail inválido"),

    // PF Identity
    fullName: z.string().optional(),
    cpf: z.string().optional(), // Add CPF validation logic ideally
    birthDate: z.string().optional(),
    phone: z.string().min(10, "Telefone inválido").optional(),

    // PJ Identity
    socialReason: z.string().optional(),
    fantasyName: z.string().optional(),
    cnpj: z.string().optional(), // Add CNPJ validation logic
    stateRegistration: z.string().optional(),
    responsibleName: z.string().optional(),
    responsibleCpf: z.string().optional(),

    // Step 2: Address
    zipCode: z.string().min(8, "CEP inválido"),
    street: z.string().min(1, "Logradouro é obrigatório"),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
    district: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(2, "Estado é obrigatório"),

    // Step 3: Professional / Company
    // PF
    education: z.string().optional(),
    professionalRegistry: z.string().optional(),
    currentCompany: z.string().optional(),
    jobRole: z.string().optional(),

    // PJ
    activityBranch: z.string().optional(),
    employeeCount: z.coerce.number().optional(),
    website: z.string().url("URL inválida").optional().or(z.literal('')),

    // Step 4: Dependents (PF Only)
    dependents: z.array(z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        kinship: z.enum(['CONJUGE', 'FILHO']),
        birthDate: z.string().min(1, "Data de nascimento é obrigatória")
    })).optional(),

    // Step 5: Documents (Files - handled visually, validation tracks presence if needed)
    // We'll store file objects in state, schema validates keys/types if we want strict check
    // For now, allow optional as the file input handles the file object

    // Step 6: Agreements
    termsAccepted: z.boolean().refine(val => val === true, { message: "Você deve aceitar os termos de uso" }),
    lgpdAccepted: z.boolean().refine(val => val === true, { message: "Você deve autorizar o tratamento de dados" }),
}).superRefine((data, ctx) => {
    if (data.type === 'PF') {
        if (!data.fullName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nome Completo é obrigatório", path: ['fullName'] });
        if (!data.cpf) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CPF é obrigatório", path: ['cpf'] });
        if (!data.birthDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Data de Nascimento é obrigatória", path: ['birthDate'] });
        if (!data.phone) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Telefone é obrigatório", path: ['phone'] });
    } else {
        if (!data.socialReason) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Razão Social é obrigatória", path: ['socialReason'] });
        if (!data.cnpj) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CNPJ é obrigatório", path: ['cnpj'] });
        if (!data.responsibleName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nome do Responsável é obrigatório", path: ['responsibleName'] });
        if (!data.responsibleCpf) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CPF do Responsável é obrigatório", path: ['responsibleCpf'] });
    }
});
