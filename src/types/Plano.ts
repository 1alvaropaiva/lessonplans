export interface Rubrica {
    Excelente: string;
    Bom: string;
    "Em Desenvolvimento": string;
}

export interface PlanoDeAula {
    id?: number;
    user_id: string;
    tema: string;
    ano_escolar: string;
    disciplina: string;
    introducao_ludica: string;
    objetivo_bncc: string;
    passo_a_passo: string;
    rubrica_avaliacao: Rubrica;
    created_at?: string;
}
