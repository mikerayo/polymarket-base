/*
 * Backend API para el clon de Polymarket.  Este servidor actúa como un
 * intermediario entre el frontend y los contratos inteligentes desplegados en
 * Base.  Proporciona puntos de entrada REST para consultar mercados y crear
 * nuevos mercados.  Utiliza ethers.js para interactuar con la blockchain.
 */

const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Cargar variables de entorno
const { RPC_URL, PRIVATE_KEY, CTF_ADDRESS, EXCHANGE_ADDRESS, ADAPTER_ADDRESS, PORT } = process.env;

// Configurar proveedor y cartera.  El backend nunca debería exponer la clave
// privada; simplemente se utiliza para firmar transacciones cuando es
// necesario (por ejemplo, al crear mercados).  Si solo se realizan llamadas
// de lectura, se puede omitir la clave y utilizar un proveedor público.
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;

// Cargar ABIs compilados.  Necesitarás compilar los contratos con Hardhat
// para generar estos artefactos en `artifacts/`.
// Para simplificar, se requiere que copies los archivos JSON generados en la
// siguiente ruta relativa:
//   backend/artifacts/contracts/<Contract>.sol/<Contract>.json
// Cuando uses `npx hardhat compile` en la carpeta contracts, se crearán
// automáticamente esos artefactos.

let ctfAbi, exchangeAbi, adapterAbi;
try {
  ctfAbi = require('../artifacts/contracts/ConditionalTokens.sol/ConditionalTokens.json').abi;
  exchangeAbi = require('../artifacts/contracts/CTFExchange.sol/CTFExchange.json').abi;
  adapterAbi = require('../artifacts/contracts/UmaCtfAdapter.sol/UmaCtfAdapter.json').abi;
} catch (err) {
  console.warn('No se encontraron los artefactos ABI. Asegúrate de compilar los contratos y copiar los JSON en backend/artifacts.');
}

// Inicializar instancias de contrato si se proporcionan direcciones y ABIs
let ctf, exchange, adapter;
if (CTF_ADDRESS && ctfAbi) {
  ctf = new ethers.Contract(CTF_ADDRESS, ctfAbi, signer || provider);
}
if (EXCHANGE_ADDRESS && exchangeAbi) {
  exchange = new ethers.Contract(EXCHANGE_ADDRESS, exchangeAbi, signer || provider);
}
if (ADAPTER_ADDRESS && adapterAbi) {
  adapter = new ethers.Contract(ADAPTER_ADDRESS, adapterAbi, signer || provider);
}

/**
 * GET /markets
 * Devuelve una lista de mercados disponibles.  En una implementación real
 * deberías consultar un subgraph o la base de datos.  Aquí se devuelve un
 * array de ejemplo.  Adapta esta función a tus necesidades.
 */
app.get('/markets', async (_req, res) => {
  try {
    // TODO: implementar lectura real desde subgraph o desde los eventos del
    // contrato para listar condiciones/mercados abiertos.
    const dummy = [
      { id: 1, question: '¿Ganárá el equipo A el próximo partido?', state: 'open' },
    ];
    res.json(dummy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener mercados' });
  }
});

/**
 * POST /markets/create
 * Crea un nuevo mercado.  Debes proporcionar en el cuerpo de la petición
 * `questionId`, `ancillaryData`, `outcomeSlotCount` y `endTime`.  Esta ruta
 * invoca al adaptador UMA para preparar la condición en CTF y enviar la
 * solicitud de resolución al oráculo UMA.
 */
app.post('/markets/create', async (req, res) => {
  const { questionId, ancillaryData, outcomeSlotCount, endTime } = req.body;
  if (!signer) {
    return res.status(400).json({ error: 'El backend no está configurado con una clave privada para firmar transacciones.' });
  }
  if (!adapter) {
    return res.status(500).json({ error: 'Adaptador UMA no inicializado. Comprueba la configuración.' });
  }
  try {
    // Aquí se debería construir la solicitud para el oráculo UMA.  El método
    // exacto depende de la versión del adaptador y del oráculo.  Como ejemplo,
    // suponemos que el adaptador tiene una función `prepareCondition` que
    // prepara la condición en CTF y envía la request a UMA.
    const tx = await adapter.prepareCondition(
      questionId,
      ancillaryData,
      outcomeSlotCount,
      endTime
    );
    console.log('Transacción enviada:', tx.hash);
    const receipt = await tx.wait();
    res.json({ txHash: receipt.transactionHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error al crear mercado' });
  }
});

app.listen(PORT || 4000, () => {
  console.log(`API escuchando en el puerto ${PORT || 4000}`);
});
