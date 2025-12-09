import { supabase } from "./supabase";
import type { PlanoDeAula } from "../types/Plano";

export async function listarPlanos(userId: string) {
    return supabase
        .from("planos_de_aula")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {ascending: false});
}

export async function buscarPlano(id: number) {
    return supabase
        .from("planos_de_aula")
        .select("*")
        .eq("id", id)
        .single();
}

export async function criarPlano(plano: PlanoDeAula) {
    return supabase
        .from("planos_de_aula")
        .insert([plano])
        .select()
        .single();
}

export async function excluirPlano(id: number) {
    return supabase.from("planos_de_aula").delete().eq("id", id);
}
