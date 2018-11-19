/**
 * Representação de linha ônibus na API. Ocorrencias não são utilizadas na exibição de itinerários.
 */
export type tuplaPonto = {
    endereco: string;
    numero_ponto?: number;
    ponto_saida?: number;
    ponto_chegada?: number;
    tipo: string;
    quantidade?: any;
    geojson?: string;
    nome?: any;
}