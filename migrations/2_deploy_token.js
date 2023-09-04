const TokenUc3m = artifacts.require("uc3mtoken");
const Votaciones = artifacts.require("Votaciones");

module.exports = function (deployer) {
  deployer.deploy(TokenUc3m, 10000000)
  .then(function() {
    //Despliegue del segundo contrato pasando la dirección del contrato del token al constructor del contrato de las votaciones
    return deployer.deploy(Votaciones, TokenUc3m.address);
  });
};