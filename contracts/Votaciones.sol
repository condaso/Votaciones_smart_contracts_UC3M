// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;
import "./uc3mtoken.sol"; 


contract Votaciones{

    ////////////////////////////////////////////////////////////   VARIABLES GLOBALES   ////////////////////////////////////////////////////////////
    address owner;                          //Propietario del contrato 

    uint contador_id = 0;                   //contador para el id del candidato
    bool empate = false;

    struct candidato {

        string nombre_candidato;   
        uint edad_candidato; 
        uint id_candidato; 
        uint numero_votos;

    }

    candidato[] public lista_candidatos;    //Lista con todos los candidatos 
    candidato public ganador;               //Ganador de las elecciones
    candidato[] public lista_empates;       //Lista con los candidatos que han empatado
    uint256 public periodo_votaciones_fin;  //Se marca la fecha de finalización mediante un timestamp posterior
    bool cierre_votaciones = false;         //Para comprobar si las elecciones ya han sido cerradas o no
    uint contador_votos = 0; 

    //Creacion del token
    uc3mtoken uc3mToken; 

    ////////////////////////////////////////////////////////////    CONSTRUCTOR     ////////////////////////////////////////////////////////////
    constructor(uc3mtoken uc3mToken_) {
        uc3mToken = uc3mToken_;
        owner = msg.sender;  
        inicializarCandidatos();
    }

    ////////////////////////////////////////////////////////////    FUNCIONES   ////////////////////////////////////////////////////////////

    function inicializarCandidatos() public soloUniversidad{//Las edades han sido puestas en un valor por defecto

        lista_candidatos.push(candidato(unicode"Jesús Javier Sánchez",40 ,1, 0));
        lista_candidatos.push(candidato(unicode"Ángel Arias",40, 2, 0));
        lista_candidatos.push(candidato(unicode"Ignacio Aedo",40, 3, 0));
        lista_candidatos.push(candidato(unicode"Álvaro Escribano",40, 4, 0));
        lista_candidatos.push(candidato(unicode"Carlos José Elías",40, 5, 0));
        lista_candidatos.push(candidato(unicode"María Isabel Gutierrez",40, 6, 0));

    }
    
    function get_cierre_votaciones() public view returns(bool){
        
        return cierre_votaciones; 
    }
    
    function insertarCandidato(string memory nombre_candidato_, uint edad_candidato_) public soloUniversidad{

        contador_id = lista_candidatos.length;
        contador_id++; 
            lista_candidatos.push(candidato(nombre_candidato_, edad_candidato_, contador_id, 0)); 
            emit nuevoCandidato(string(abi.encodePacked(nombre_candidato_,"se presenta a las elecciones para rector de la UC3M"))); 

    }

    function eliminarCandidato(uint id_candidato_) public soloUniversidad() {
       
        require(id_candidato_<=contador_id, "El id del candidato que quieres eliminar no es correcto");

            uint index = 0; 
            for(uint a = 0; a<lista_candidatos.length; a++){
                if(lista_candidatos[a].id_candidato == id_candidato_){
                    index = a; 
                }
            }

            for(uint r = index; r<lista_candidatos.length; r++){
                if(r == lista_candidatos.length - 1){
                    lista_candidatos.pop();
                }
                else{
                    lista_candidatos[r] = lista_candidatos[r+1];
                }
                
            }
    }

    function verCandidatos() public view returns(candidato[] memory) {

        return lista_candidatos; 
    }

    function activarVotaciones() public soloUniversidad{

        require(cierre_votaciones == false);  
        periodo_votaciones_fin = block.timestamp + 540 minutes; //Tiempo establecido en el reglamento oficial. 

    }

    function votar(uint id_candidato_) public periodoVotaciones soloVotante {

        uint256 tokenAmount = 100;
        
        require(uc3mToken.balanceOf(msg.sender) >= tokenAmount, "No precisas del token para poder votar");
        require(id_candidato_ > 0 && id_candidato_ <= contador_id, unicode"El id de candidato por el que estás intentando votar es incorrecto");

        lista_candidatos[id_candidato_ - 1].numero_votos++; //Se suma el voto al candidato

        votante[msg.sender] = true;

        uc3mToken.transfer_token(msg.sender, address(this), tokenAmount); //Transfiero el token del votante a la universidad

        contador_votos++; 

    }

    function solicitarToken (uint nia_, string memory password_) public {

        bytes32 hash_datos = keccak256(abi.encodePacked(nia_,password_)); 

        require(hash_estudiante[nia_] == hash_datos, unicode"No estás presente en la lista de la universidad, ponte en contacto con ellos"); 

        require(uc3mToken.balanceOf(msg.sender) == 0, "Ya has recibido el token anteiormente"); 

        require(votante[msg.sender] == false, "Ya has votado anteriormente");

        uc3mToken.transfer_token(owner, msg.sender, 100);

    }

    function anadirHashNuevo(uint nia_, bytes32 hash_) public soloUniversidad{

        hash_estudiante[nia_] = hash_;

    }

    function publicacionResultados() public soloUniversidad{

        require(block.timestamp>periodo_votaciones_fin, "El periodo de votacion sigue vigente"); 
        emit cierreVotacion("Se han cerrado las votaciones");
        
        ganador = lista_candidatos[0]; //Asigno como ganador el primer candidato, en caso de que los siguientes tengan más votos que éste, se asignará nuevo ganador 

        for(uint i = 1; i<contador_id; i++){
            if(lista_candidatos[i].numero_votos > ganador.numero_votos){
                ganador = lista_candidatos[i]; 
            }
        }

        for(uint j = 0; j<contador_id; j++){
            if((lista_candidatos[j].numero_votos == ganador.numero_votos) && (lista_candidatos[j].id_candidato != ganador.id_candidato)){//Compruebo si hay empate con el ganador provisional
                empate = true; 
                lista_empates.push(lista_candidatos[j]); 
            }
        }

        
        if(empate == true){
            emit publicacion_empate("Ha habido un empate"); 
        }
        if((empate != true) && ((ganador.numero_votos) > (contador_votos/2))){
            emit publicacion_ganador(concat("El nuevo Rector de la Universidad Carlos III de Madrid es:  ", ganador.nombre_candidato));
        }
        else{
            emit publicacion_ganador("Se tiene que producir una segunda vuelta para declarar el ganador definitivo");
        }    

        cierre_votaciones = true;

    }

    function verPorcentajeVotos() public view returns (candidato[] memory){

        require(block.timestamp>periodo_votaciones_fin, "El periodo de votacion sigue vigente"); 
        return lista_candidatos;

    }

    function concat(string memory a, string memory b) internal pure returns (string memory) { //Función auxiliar para concatenar strings

    return string(abi.encodePacked(a, b));

    }

    //////////////////////////////////////////////////////////// MODIFIERS ////////////////////////////////////////////////////////////
    modifier soloUniversidad(){
        require(msg.sender == owner,unicode"Estás intentando acceder a una función de la Universidad"); 
        _; 
    }

    modifier soloVotante(){
        require(votante[msg.sender] == false,unicode"No tienes permisos para poder votar");
        _; 
    }

    //Mira si está abierto el periodo de votaciones 
    modifier periodoVotaciones(){ 
        require(block.timestamp <= periodo_votaciones_fin, "El periodo de votaciones ya ha acabado");
        _;
    }

    //////////////////////////////////////////////////////////// EVENTOS ////////////////////////////////////////////////////////////
    event nuevoCandidato(string);  
    event cierreVotacion(string);
    event publicacion_ganador(string);
    event publicacion_empate(string);

    //////////////////////////////////////////////////////////// MAPPINGS ////////////////////////////////////////////////////////////
    mapping (address => bool) votante; //Me relaciona un usuario con si ya ha votado una vez
    mapping (uint => bytes32) hash_estudiante; 


}