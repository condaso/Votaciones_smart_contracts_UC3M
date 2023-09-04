
const botonVotacion = document.querySelector("#votar_id")
const botonToken = document.querySelector("#solicitar_token")
const botonHash = document.querySelector("#add_hash") 
const botonCandidato = document.querySelector("#insertar_candidato")
const botonVerCandidato = document.querySelector("#ver_candidatos")
const botonVerGanador = document.querySelector("#ver_ganador")
const botonActivarVotaciones = document.querySelector("#activar_votaciones")
const botonEliminarCandidato = document.querySelector("#eliminar_candidato")


document.addEventListener("DOMContentLoaded", () => {
    App.init()
})

botonVotacion.addEventListener("submit", e => {
    e.preventDefault()

    App.votar(botonVotacion["id_candidato"].value)
})

botonToken.addEventListener("submit", e => {
    e.preventDefault()

    App.solicitar_token(botonToken["nia"].value, botonToken["password"].value)
})

botonHash.addEventListener("submit", e => {
    e.preventDefault()

    App.add_hash(botonHash["nia"].value ,botonHash["hash_alumno"].value)
})

botonCandidato.addEventListener("submit", e => {
    e.preventDefault()

    App.add_candidate(botonCandidato["nombre_candidato"].value ,botonCandidato["edad_candidato"].value)
})

botonEliminarCandidato.addEventListener("submit", e => {
    e.preventDefault()

    App.delete_candidate(botonEliminarCandidato["id_candidato_eliminar"].value)
})


botonVerCandidato.addEventListener("submit", e => {
    e.preventDefault()

    App.showCandidates()
})

botonVerGanador.addEventListener("submit", e => {
    e.preventDefault()

    App.showWinner()
})

botonActivarVotaciones.addEventListener("submit", e => {
    e.preventDefault()

    App.active_voting()
})



