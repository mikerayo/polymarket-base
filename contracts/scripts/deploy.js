/*
 * Script de despliegue de los contratos principales: ConditionalTokens,
 * UmaCtfAdapter y CTFExchange.  Ejecuta este script con Hardhat, por
 * ejemplo: `npx hardhat run scripts/deploy.js --network baseSepolia`.
 *
 * Requiere que las variables de entorno estén definidas en `.env`:
 *   - PRIVATE_KEY
 *   - UMA_FINDER
 *   - COLLATERAL_TOKEN
 */

const hre = require('hardhat');
require('dotenv').config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Desplegando contratos con la cuenta:', deployer.address);

  // 1. Desplegar ConditionalTokens
  const CTF = await hre.ethers.getContractFactory('ConditionalTokens');
  const ctf = await CTF.deploy();
  await ctf.deployed();
  console.log('ConditionalTokens desplegado en:', ctf.address);

  // 2. Desplegar UmaCtfAdapter
  // El constructor suele requerir al menos la dirección del CTF y del UMA Finder.
  const finderAddress = process.env.UMA_FINDER;
  if (!finderAddress) {
    throw new Error('UMA_FINDER no definido en el archivo .env');
  }
  const Adapter = await hre.ethers.getContractFactory('UmaCtfAdapter');
  const adapter = await Adapter.deploy(ctf.address, finderAddress);
  await adapter.deployed();
  console.log('UmaCtfAdapter desplegado en:', adapter.address);

  // 3. Desplegar CTFExchange
  const collateral = process.env.COLLATERAL_TOKEN;
  if (!collateral) {
    throw new Error('COLLATERAL_TOKEN no definido en el archivo .env');
  }
  const Exchange = await hre.ethers.getContractFactory('CTFExchange');
  const exchange = await Exchange.deploy(ctf.address, collateral);
  await exchange.deployed();
  console.log('CTFExchange desplegado en:', exchange.address);

  console.log('\nDirecciones finales:');
  console.log('CTF_ADDRESS=', ctf.address);
  console.log('ADAPTER_ADDRESS=', adapter.address);
  console.log('EXCHANGE_ADDRESS=', exchange.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
