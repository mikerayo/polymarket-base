# Polymarket‑Base

Este repositorio es un clon de la infraestructura on‑chain de Polymarket preparado para desplegarse sobre la red **Base** (Mainnet 8453 o Sepolia 84532).  Incluye una configuración de contratos inteligentes (basada en los repositorios de [Gnosis Conditional Tokens](https://github.com/gnosis/conditional-tokens-contracts), [Polymarket UMA Adapter](https://github.com/Polymarket/uma-ctf-adapter) y [Polymarket CTF Exchange](https://github.com/Polymarket/ctf-exchange)), un backend en Node/Express que interactúa con dichos contratos a través de `ethers.js` y un frontend sencillo en React que consume la API del backend.

**Atención:** Este código es un punto de partida.  Dado que esta plantilla se ha generado sin acceso a internet en tiempo de compilación, las dependencias (contratos y librerías) no están incluidas; deberá instalarlas manualmente a través de `npm install` antes de compilar y desplegar.

## Estructura del repositorio

```
polymarket-base/
├── contracts/
│   ├── hardhat.config.js      # Configuración de Hardhat para compilar y desplegar en Base
│   ├── .env.example          # Variables de entorno de ejemplo para despliegues
│   └── scripts/
│       └── deploy.js         # Script de despliegue de CTF, UMA Adapter y Exchange
├── backend/
│   ├── package.json          # Dependencias y scripts del servidor Express
│   ├── .env.example          # Variables de entorno para el backend
│   └── src/
│       └── index.js          # Servidor Express con endpoints básicos
├── frontend/
│   ├── package.json          # Dependencias y scripts del cliente React
│   ├── webpack.config.js     # Configuración de Webpack y Babel
│   ├── public/
│   │   └── index.html        # Documento raíz del frontend
│   └── src/
│       ├── index.js          # Punto de entrada de React
│       └── App.jsx           # Componente principal
└── README.md                # Este documento
```

## Contratos (carpeta `contracts`)

El proyecto está configurado para usar **Hardhat**.  Los contratos no se incluyen aquí directamente; se importan desde los paquetes públicos de Polymarket y Gnosis.  Para compilar y desplegar debes instalar las dependencias:

```sh
cd contracts
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers dotenv
npm install @gnosis.pm/conditional-tokens-contracts @polymarket/uma-ctf-adapter @polymarket/ctf-exchange
```

Después copia `.env.example` a `.env` y rellena:

- `PRIVATE_KEY`: clave privada de la cuenta que desplegará los contratos.
- `BASE_RPC`: URL RPC de Base Mainnet o Sepolia.
- `UMA_FINDER`: dirección del **UMA Finder** en la red elegida (ver documentación de UMA para Base).
- `COLLATERAL_TOKEN`: token ERC‑20 de colateral (por defecto, USDC nativo de Base `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`).

Para desplegar:

```sh
npx hardhat run scripts/deploy.js --network base
```

El script creará una instancia de `ConditionalTokens`, `UmaCtfAdapter` y `CTFExchange`.  Anota las direcciones que imprime en consola y añádelas a las variables de entorno del backend.

## Backend (carpeta `backend`)

El backend es un servidor Express que expone una API REST mínima para interactuar con los contratos.  Se apoya en `ethers.js` para conectarse a la red Base.

Instala las dependencias desde la carpeta `backend`:

```sh
cd backend
npm install
```

Copia `.env.example` a `.env` y configura:

- `RPC_URL`: endpoint RPC de Base (por ejemplo, `https://sepolia.base.org` para pruebas).
- `PRIVATE_KEY`: clave privada de la cuenta con la que el servidor firmará transacciones (si el backend necesita crear mercados).
- `CTF_ADDRESS`, `EXCHANGE_ADDRESS`, `ADAPTER_ADDRESS`: las direcciones de tus contratos desplegados.

Lanza el servidor:

```sh
npm start
```

Por defecto escucha en el puerto 4000 y expone:

- `GET /markets`: lista de mercados (por implementar, consulta a un subgraph o base de datos).
- `POST /markets/create`: endpoint para crear un nuevo mercado (pendiente de implementación; incluye un esqueleto para invocar al adaptador UMA).

## Frontend (carpeta `frontend`)

El frontend es una aplicación React simple que consume la API del backend.  Usa Webpack y Babel para compilar el código.

Instala las dependencias desde `frontend`:

```sh
cd frontend
npm install
```

Para desarrollo local:

```sh
npm start
```

Esto abre el cliente en `http://localhost:3000` y proxyará las llamadas a `/api` hacia `http://localhost:4000`.  Modifica los componentes de React en `src/App.jsx` para incorporar todas las funcionalidades que necesites (creación de mercados, trading, depósitos, etc.).

## Notas

- Este repositorio **no incluye** ningún código propio de Polymarket; todas las importaciones provienen de paquetes open source bajo licencias compatibles (MIT y LGPL‑3.0).  El usuario final debe respetar dichas licencias al redistribuir o modificar el software.
- Asegúrate de desplegar y probar primero en Base Sepolia (`chainId 84532`) antes de pasar a Mainnet (`chainId 8453`).
- Para obtener eventos, volúmenes y datos históricos, implementa un subgraph usando el repositorio `polymarket-subgraph` apuntando a tus nuevas direcciones.
- Ajusta la UX del frontend según tus necesidades; la plantilla incluida es mínima y sirve únicamente como referencia.
