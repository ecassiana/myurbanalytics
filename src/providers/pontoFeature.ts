import L from 'leaflet';
import { Feature, Point } from "geojson"
import { Ponto } from "./ponto";

/**
 * Representa pontos de ônibus num mapa leaflet.
 *  
 */
export class PontoFeature implements Feature{
    type: "Feature" = "Feature";
    properties: Ponto | PontoAdversidade;
    geometry: Point;

    constructor(tupla: any, opcaoDado: any, adversidade?: any){
        this.type = "Feature";        
        this.geometry = JSON.parse(tupla.geojson);

        this.properties = new Ponto(tupla, opcaoDado);
    }

    static onEachPonto(feature:PontoFeature, layer) {        
        let linhasString = `<p><b><center>Número do Ponto: ${feature.properties.numero_ponto}</center></b></p>`
        
        if (feature.properties instanceof Ponto) {
            linhasString += `<p>Tipo de Ponto: ${feature.properties.tipo} </p> `;      
            linhasString += `<p> ${feature.properties.endereco} </p> `;   

            if(feature.properties.opcaoDado == 'origem') linhasString += `<p>Origem: ${feature.properties.quantidades} </p> `;
            if(feature.properties.opcaoDado == 'destino') linhasString += `<p>Destino: ${feature.properties.quantidades} </p> `;
            if(feature.properties.opcaoDado == 'pontos'){
                linhasString += `<p> Adversidades: </p> `;
                feature.properties.adversidades.forEach(element => {
                    linhasString += `<p>${element.nome}: ${element.quantidade} </p>`;
                  });    
            }
        }

        layer.bindPopup(linhasString);
    }
  
    static pontoToLayer(feature:PontoFeature, LatLng) {
        
        let cor = "yellow";
        if (feature.properties instanceof Ponto) {
            let plataformas = ["estação tubo", "plataforma", "terminal"];
            if (plataformas.indexOf(feature.properties.tipo.toLowerCase()) > -1) {
                cor = "#0006FF";
            }
        }

        return L.circleMarker(LatLng, {
            radius: 8,
            fillColor: cor,
            color: "black",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    }

}

/**
 * Usado na Busca de Rotas, que não exibe informações de linhas de ônibus.
 */
export type PontoSimples = {numero_ponto: number};
export type PontoAdversidade = {numero_ponto: number, geometry: string};