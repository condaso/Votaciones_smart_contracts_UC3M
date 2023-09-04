
var info_winner = ``;

App = {
    
    contracts: {}, 
    init: async () => {

        await App.loadEthereum()
        await App.loadAccount()
        await App.loadContracts()
        App.render()
        await App.renderBalance()

        const cierre = await App.Votaciones.get_cierre_votaciones()

        if(cierre){
            App.renderPorcentajeVotos()
        } 
        
    }, 

    loadEthereum: async () => { //Comprueba si tiene instalado el usuario la extensión de metemask

        if(window.ethereum){
            App.web3Provider = window.ethereum
            await window.ethereum.request({method: 'eth_requestAccounts'}) //Conectar la Metamask 
        }
        else if(window.web3){ //Otro proveedor web3 diferente 
            web3 = new web3(window.web3.currentProvider)
        }
        else{
            console.log('No hay ningún navegador ethereum instalado, prueba a instalar uno como Metamask')
        }
        
    },

    loadAccount: async () => {
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        App.account = accounts[0]
    },

    loadContracts: async () => {

        const res = await fetch("Votaciones.json")
        const votacionesJSON = await res.json() //Traigo el JSON

        App.contracts.Votaciones = TruffleContract(votacionesJSON) //Se convierte el JSON

        App.contracts.Votaciones.setProvider(App.web3Provider) //Conecto el contrato con metamask

        App.Votaciones = await App.contracts.Votaciones.deployed()
        
        console.log(votacionesJSON)

        //uc3mtoken.json
        const res2 = await fetch("uc3mtoken.json")
        const uc3mtokenJSON = await res2.json() //Traigo el JSON

        App.contracts.uc3mtoken = TruffleContract(uc3mtokenJSON) //Se convierte el JSON

        App.contracts.uc3mtoken.setProvider(App.web3Provider) //Conecto el contrato con metamask

        App.uc3mtoken = await App.contracts.uc3mtoken.deployed()
        
        console.log(uc3mtokenJSON)
    }, 

    render: () => {
        document.getElementById('account').innerText = App.account
    },

    renderBalance: async () => {
        const balanceToken = await App.uc3mtoken.balanceOf(
            App.account
        )
        document.getElementById('balance').innerText = balanceToken
    }, 

    votar: async (id_candidato) => { //Blockchain usa métodos asíncronos
        const result = await App.Votaciones.votar(id_candidato, {
            from: App.account
        })
        .then(function(receipt) {
            console.log(receipt);
        })
        .catch(function(error) {
            console.log(error);
            alert("Hubo un error al ejecutar la transacción. (Revisa que estás realizándolo de manera correcta)");
        }); 
    },

    solicitar_token: async (nia, password) => { //Blockchain usa métodos asíncronos
        const result2 = await App.Votaciones.solicitarToken(nia, password, {
            from: App.account
        })
        .then(function(receipt) {
            console.log(receipt);
        })
        .catch(function(error) {
            console.log(error);
            alert("Hubo un error al ejecutar la transacción. (Revisa que estás realizándolo de manera correcta)");
        }); 
    },

    add_hash: async (nia, hash_alumno) => { //Blockchain usa métodos asíncronos 
        const result3 = await App.Votaciones.anadirHashNuevo(nia, hash_alumno, {
            from: App.account
        })
        .then(function(receipt) {
            console.log(receipt);
        })
        .catch(function(error) {
            console.log(error);
            alert("Hubo un error al ejecutar la transacción. (Revisa que estás realizándolo de manera correcta)");
        }); 
    }, 

    add_candidate: async (nombre_candidato, edad_candidato) => { //Blockchain usa métodos asíncronos
        const result4 = await App.Votaciones.insertarCandidato(nombre_candidato, edad_candidato, {
            from: App.account
        })
        .then(function(receipt) {
            console.log(receipt);
        })
        .catch(function(error) {
            console.log(error);
            alert("Hubo un error al ejecutar la transacción. (Revisa que estás realizándolo de manera correcta)");
        });      
    },

    showCandidates: async () => { //Blockchain usa métodos asíncronos
        const result5 = await App.Votaciones.verCandidatos({
            from: App.account
        })
        let html = '<h4>Lista de candidatos:</h4>'
        
            for(let i = 0; i<result5.length; i++){
                const candidato = await App.Votaciones.verCandidatos()
                const nombre_cand = candidato[i][0]
                const id_candidato = candidato[i][2]
                
                let info_candidato = ` 
                <div class>
                
                <span><h4>NOMBRE: ${nombre_cand}, ID del candidato: ${id_candidato}</h4></span>
                    <div>
                </div>
                </div>
                `;
                html += info_candidato;
            }
        
            document.querySelector('#ver_candidatos').innerHTML = html;
        
    }, 
    

    showWinner: async () => { 
        const result6 = await App.Votaciones.publicacionResultados({
            from: App.account
        })
        .then(function(receipt) {
        const cierre_votaciones = receipt.logs[0].args[0]; 
        const resultado = receipt.logs[1].args[0]; 
            let html = ''
            info_winner = `      
                 <div>
                 <span><h4>${cierre_votaciones}, </h4></span>
                 <span><h4>${resultado}</h4></span>
                     <div>
                 </div>
                 `
             
             html = info_winner;
             document.querySelector('#ver_ganador').innerHTML = html;

        })
        .catch(function(error) {
            console.log(error);
            alert("Hubo un error al ejecutar la transacción. (Revisa que estás realizándolo de manera correcta)");
        }); 
    
    },

    renderPorcentajeVotos: async () => { //Blockchain usa métodos asíncronos
        const result10 = await App.Votaciones.verPorcentajeVotos({
            from: App.account
        })
        let html = ''
        
            for(let i = 0; i<result10.length; i++){
                const candidato = await App.Votaciones.verPorcentajeVotos()
                console.log(candidato)
                const nombre_cand = candidato[i][0]
                const numero_votos = candidato[i][3]
                
                let info_candidato = ` 
                <div class="derecha">
                <span><h4>NOMBRE: ${nombre_cand}   ,NÚMERO DE VOTOS: ${numero_votos} </h4></span>
                    <div>
                </div>
        
                </div>
                `;
                html += info_candidato;
            }
        
            document.querySelector('#ver_ganador').innerHTML = html; 
    }, 

    active_voting: async () => { 
        const result7 = await App.Votaciones.activarVotaciones({
            from: App.account
        })
        .then(function(receipt) {
            console.log(receipt);
        })
        .catch(function(error) {
            console.log(error);
            alert("Hubo un error al ejecutar la transacción. (Revisa que estás realizándolo de manera correcta)");
        }); 
    }, 

    delete_candidate: async (id_candidato_eliminar) => { 
        const result8 = await App.Votaciones.eliminarCandidato(id_candidato_eliminar, {
            from: App.account
        })
        .then(function(receipt) {
            console.log(receipt);
        })
        .catch(function(error) {
            console.log(error);
            alert("Hubo un error al ejecutar la transacción.");
        });      
    }

}



