import { Component, ViewChild, ElementRef, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading, ModalController } from 'ionic-angular';

import 'leaflet';
import 'leaflet.markercluster';
import { Map, GeoJSON, GeoJSONOptions } from 'leaflet'
import { PontoFeature } from '../../providers/pontoFeature';
import { Ponto } from '../../providers/ponto';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { SobrePage } from '../sobre/sobre';
const L = window['L'];

@IonicPage()
@Component({
  selector: 'page-ponto',
  templateUrl: 'ponto.html',
})

export class PontoPage implements  OnDestroy {

  //@ViewChild(SobrePage) telaSobre: SobrePage;

  @ViewChild('pontomap') mapContainer: ElementRef;
  map: Map;

  loading: Loading;
  loadingIsDismissed: boolean = false;

  tiposPontosSubscription: Subscription;
  bairrosSubscription: Subscription;
  mapaOrigemSubscription: Subscription;
  mapaDestinoSubscription: Subscription;
  crowdSourcingPontoMapaSubscription: Subscription;

  listaTiposPontos: any[]; // Lista de tipos de pontos de ônibus.
  listaBairros: any[];     // Lista de nomes de bairros.
  listaAdversidades:any[]; // Lista de nomes de adversidades.
  listaPontos: any[];      // Lista de pontos de ônibus retornados.

  opcaoDado; // Indica qual tipo de dados está sendo visualizado: origem, destino ou adversidades de pontos de ônibus.

  tipoPonto;   // Indica se existe algum tipo de pontos de ônibus selecionado.
  bairro;      // Indica se existe um bairro selecionado.
  adversidade; // Indica se existe um tipo de adversidade selecionada.
  dataInicio;  // Indica a data inicial do período.
  dataFim;     // Indica a data final do período.
  faixaHorario: any = { // Indicia o horário inicial e final do período.
    upper:23,
    lower:0
  };

  clusterGroup: any;
  pontosLayer: GeoJSON<Ponto>;

  private readonly BAIRROS_API = 'http://myurb-smartpomodoro.1d35.starter-us-east-1.openshiftapps.com/restfulapi/pontos/bairros';
  private readonly TIPOS_PONTOS_API = 'http://myurb-smartpomodoro.1d35.starter-us-east-1.openshiftapps.com/restfulapi/pontos/tipos_pontos';
  private readonly MAPA_ORIGEM_API = 'http://myurb-smartpomodoro.1d35.starter-us-east-1.openshiftapps.com/restfulapi/portal/mapa_origem';
  private readonly MAPA_DESTINO_API = ' http://myurb-smartpomodoro.1d35.starter-us-east-1.openshiftapps.com/restfulapi/portal/mapa_destino';
  private readonly CROWDSOURCING_PONTO_MAPA_API = 'http://myurb-smartpomodoro.1d35.starter-us-east-1.openshiftapps.com/restfulapi/portal/crowdsourcing_pontos_mapa';

  showLayers: () => Map;

  /***
   * Construtor: inicializa a lista de bairos, tipos de pontos e adversidades. 
   * Também altera todos os filtros para o padrão.
   */
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public http: HttpClient,
    public modalCtrl: ModalController) 
    {
      this.loading = this.loadingCtrl.create();
      this.loading.present();

      this.bairrosSubscription = this.getListaBairros();
      this.tiposPontosSubscription = this.getListaTiposPontos();
      this.listaAdversidades = ['Todos','Falta de Iluminação','Problemas com o ponto', 'Violência', 'Assalto', 'Atraso', 'Lotação', 'Tumulto']

      this.opcaoDado = 'origem';
      this.tipoPonto = 'Todos';
      this.bairro = 'TODOS';
      this.adversidade = 'Todos';
      this.dataInicio = '0000-01-01';
      this.dataFim = '9999-12-31';
      this.faixaHorario.upper = 23;
      this.faixaHorario.lower = 0;

      this.clusterGroup = L.markerClusterGroup({maxClusterRadius: this.zoomRadius, animate: true, chunkedLoading: true});

      this.loading.dismiss();
    }

  ngOnDestroy() {
    this.tiposPontosSubscription.unsubscribe();
    this.bairrosSubscription.unsubscribe();
  }

  ionViewDidEnter() {
    this.initializeMap();
  }

  initializeMap(){
    this.map = L.map("pontomap", { zoomControl: true });
    this.map.zoomControl.setPosition('bottomright');

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com" target="_blank">Mapbox</a>'
    }).addTo(this.map);

    this.map.setView(new L.LatLng(-25.4284, -49.2733), 12); //Curitiba    
  }

  ionViewWillLeave() {
    this.map.off();
    this.map.remove();
    document.getElementById('pontomap').innerHTML = "<div id='pontomap'></div>";
  }

  /***
   * Inicializa a lista de bairros, usada para listar as opções de filtro na página.
   */
  getListaBairros() {
    return this.http.get(this.BAIRROS_API).subscribe((bairrosRetornados: any[]) => {
      this.listaBairros = bairrosRetornados.map((bairro) => {
        return bairro.nome;
      });
      this.listaBairros.unshift('TODOS');
    });
  }

  /***
   * Inicializa a lista de tipos de pontos de ônibus, usada para listar as opções de filtro na página.
   */
  getListaTiposPontos(){
    return this.http.get(this.TIPOS_PONTOS_API).subscribe((tiposPontosRetornados: any[]) => {
      this.listaTiposPontos = tiposPontosRetornados.map((tipoPonto) => {
        return tipoPonto.tipo;
      });
      this.listaTiposPontos.unshift('Todos');
    });
  }
  
  /***
   * Ao acionar o botão "?", abre a página de ajuda.
   */
  BotaoAjuda(){ 
    let contactModal = this.modalCtrl.create(SobrePage);
    contactModal.present();
  }

  /***
   * Ao acionar o botão "APLICAR FILTROS", na aba "ORIGEM", chama o método 
   * para realizar a consulta dos pontos, aplicando os filtros, caso exisam.
   */
  FiltroOrigem(){  
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    this.getMapaOrigem();
  }

  /***
   * Ao acionar o botão "APLICAR FILTROS", na aba "DESTINO", chama o método 
   * para realizar a consulta dos pontos, aplicando os filtros, caso exisam.
   */
  FiltroDestino(){
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    this.getMapaDestino();
   }

  /***
   * Ao acionar o botão "APLICAR FILTROS", na aba "PONTOS", chama o método 
   * para realizar a consulta dos pontos, aplicando os filtros, caso exisam.
   */
  FiltroPontos(){ 
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    this.getPontosAdversidadesMapa();
  }

  /***
   * Ao acionar o botão "LIMPAR FILTROS", em qualquer uma das abas, restaura os 
   * valores dos filtros para os valores iniciais.
   */

  LimparFiltros(){
    this.tipoPonto = 'Todos';
    this.bairro = 'TODOS';
    this.adversidade = 'Todos';
    this.dataInicio = '0000-01-01';
    this.dataFim = '9999-12-31';
    this.faixaHorario.upper = 23;
    this.faixaHorario.lower = 0;
  }

  MontarFiltro(){
    let filtroString = '';

    if(this.bairro != 'TODOS')
    {
      filtroString += '?bairro=' + this.bairro;
    } 

    if(this.dataInicio != '0000-01-01' || this.dataFim != '9999-12-31') {
      if(filtroString.length > 0) filtroString += '&';
      else filtroString += '?';
      filtroString += 'dia_inicio=' + this.dataInicio + '&dia_fim=' + this.dataFim;
    }

    if(this.faixaHorario.upper != 23 || this.faixaHorario.lower != 0){
      if(filtroString.length > 0) filtroString += '&';
      else filtroString += '?';
      let hora_inicio = this.faixaHorario.lower < 10 ? 'hora_inicio=0' : 'hora_inicio=';
      let hora_fim = this.faixaHorario.upper < 10 ? ':00&hora_fim=0' : ':00&hora_fim=';
      filtroString += hora_inicio + this.faixaHorario.lower + hora_fim + this.faixaHorario.upper + ':00';
    }

    return filtroString;
  }

  /***
   * Responsável por consultar os pontos de ônibus utilizados como origem.
   */
  getMapaOrigem(){ 
    let filtroString = this.MontarFiltro();

    return this.http.get(this.MAPA_ORIGEM_API+filtroString).subscribe((pontosRetornados: any[]) => {
      
      this.listaPontos = pontosRetornados.map((ponto) => {

        if(this.tipoPonto == 'Todos' || this.tipoPonto == ponto.tipo) return new PontoFeature(ponto, this.opcaoDado);
        else return null;

      });
      
      this.listaPontos = this.listaPontos.filter(ponto => ponto != null);
      if(this.pontosLayer) this.map.removeLayer(this.pontosLayer);
 
      if(this.listaPontos.length > 0){

        this.clusterGroup.remove(this.pontosLayer);
        this.pontosLayer = null;
        this.clusterGroup = null;
        this.clusterGroup = L.markerClusterGroup({maxClusterRadius: this.zoomRadius, animate: true, chunkedLoading: true});
 
        this.pontosLayer = L.geoJSON( this.listaPontos,
          <GeoJSONOptions>{ onEachFeature: PontoFeature.onEachPonto, pointToLayer: PontoFeature.pontoToLayer }
        );
        
        this.clusterGroup.addLayer(this.pontosLayer);
        this.map.addLayer(this.clusterGroup);
      }

      this.listaPontos.forEach(ponto =>{ this.listaPontos.pop(); });

      this.loading.dismiss();

    },
    (err)=>{
      this.loading.dismiss();
      console.error(err);
    });
  }

  /***
   * Responsável por consultar os pontos de ônibus utilizados como destino.
   */
  getMapaDestino(){
    let filtroString = this.MontarFiltro();

    return this.http.get(this.MAPA_DESTINO_API+filtroString).subscribe((pontosRetornados: any[]) => {
      this.listaPontos = pontosRetornados.map((ponto) => {

        if(this.tipoPonto == 'Todos' || this.tipoPonto == ponto.tipo) return new PontoFeature(ponto, this.opcaoDado);
        else return null;

      });
      
      this.listaPontos = this.listaPontos.filter(ponto => ponto != null);
      if(this.pontosLayer) this.map.removeLayer(this.pontosLayer);
 
      if(this.listaPontos.length > 0){

        this.clusterGroup.remove(this.pontosLayer);
        this.pontosLayer = null;
        this.clusterGroup = null;
        this.clusterGroup = L.markerClusterGroup({maxClusterRadius: this.zoomRadius, animate: true, chunkedLoading: true});
 
        this.pontosLayer = L.geoJSON( this.listaPontos,
          <GeoJSONOptions>{ onEachFeature: PontoFeature.onEachPonto, pointToLayer: PontoFeature.pontoToLayer }
        );
        
        this.clusterGroup.addLayer(this.pontosLayer);
        this.map.addLayer(this.clusterGroup);
      }

      this.listaPontos.forEach(ponto =>{ this.listaPontos.pop(); });

      this.loading.dismiss();

    },
    (err)=>{
      this.loading.dismiss();
      console.error(err);
    });
  }

  /***
   * Responsável por consultar os pontos de ônibus com adversidades.
   */
  getPontosAdversidadesMapa(){ 
    let filtroString = this.MontarFiltro();

    return this.http.get(this.CROWDSOURCING_PONTO_MAPA_API+filtroString).subscribe((pontosRetornados: any[]) => {
      
      let listaAux = {};
      pontosRetornados.forEach((p) => {
        if( ( this.tipoPonto == 'Todos' || this.tipoPonto == p.tipo ) && (this.adversidade == 'Todos' || this.adversidade == p.nome)){
          if(listaAux[p.numero_ponto]){
            listaAux[p.numero_ponto].properties.adicionarAdversidade(p);
          } else {
            listaAux[p.numero_ponto] = new PontoFeature(p, this.opcaoDado);
          }
        }
      });
      
      this.listaPontos = [];
      for (const num in listaAux) {
        this.listaPontos.push(listaAux[num]);
      }

      if(this.pontosLayer) this.map.removeLayer(this.pontosLayer);
 
      if(this.listaPontos.length > 0){

        this.clusterGroup.remove(this.pontosLayer);
        this.pontosLayer = null;
        this.clusterGroup = null;
        this.clusterGroup = L.markerClusterGroup({maxClusterRadius: this.zoomRadius, animate: true, chunkedLoading: true});
 
        this.pontosLayer = L.geoJSON( this.listaPontos,
          <GeoJSONOptions>{ onEachFeature: PontoFeature.onEachPonto, pointToLayer: PontoFeature.pontoToLayer }
        );
        
        this.clusterGroup.addLayer(this.pontosLayer);
        this.map.addLayer(this.clusterGroup);
      }

      this.listaPontos.forEach(ponto =>{ this.listaPontos.pop(); });

      this.loading.dismiss();

    },
    (err)=>{
      this.loading.dismiss();
      console.error(err);
    });
  }
    
  private zoomRadius(zoom){
    if(zoom > 16) return 0;
    else if (zoom == 16) return 50;
    else return 80;
  }
}