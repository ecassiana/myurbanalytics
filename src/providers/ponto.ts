import { tuplaPonto } from "./types";

/**
 * Representa um ponto de ônibus.
 */
export class Ponto { 
    endereco: string;
    numero_ponto: number;
    tipo: string;
    opcaoDado: any;
    adversidades?: Adversidade[];
    quantidades?: any;

    constructor (tupla:tuplaPonto, opcaoDado: any){
        this.endereco = tupla.endereco;
        if(tupla.numero_ponto) this.numero_ponto = tupla.numero_ponto;
        else if(tupla.ponto_chegada) this.numero_ponto = tupla.ponto_chegada;
        else if(tupla.ponto_saida) this.numero_ponto = tupla.ponto_saida;
        this.tipo = tupla.tipo;
        this.opcaoDado = opcaoDado;
        if(tupla.quantidade && opcaoDado!="pontos") this.quantidades = tupla.quantidade;
        else if(tupla.quantidade) this.adversidades = [{nome:tupla.nome, quantidade:tupla.quantidade}];
    }

    adicionarAdversidade(tupla:tuplaPonto){
        this.adversidades.push({nome:tupla.nome, quantidade:tupla.quantidade});
    }
}

export type Adversidade = { nome: any; quantidade: any; }