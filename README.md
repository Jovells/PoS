# Multi-Token POS DApp Readme

Welcome to the Multi-Token POS DApp repository! This decentralized application (DApp) is built using Solidity, Hardhat, and Vite to create a multi-token Point of Sale system for use in various decentralized applications and platforms. This README will guide you through setting up, deploying, and using this DApp.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Smart Contracts](#smart-contracts)
- [Frontend](#frontend)
- [Deployment](#deployment)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine.
- Basic knowledge of Solidity, Ethereum, and web development.
- A code editor of your choice (e.g., Visual Studio Code).
- MetaMask extension for interacting with the DApp.

## Installation

1. Clone the repository to your local machine:

```bash
git clone https://github.com/jovells/pos.git
```

2. Navigate to the project directory:

```bash
cd multi-token-pos-dapp
```

3. Install the project dependencies:

```bash
yarn install
```

## Smart Contracts

The smart contracts for this DApp are written in Solidity and can be found in the `blockchain/contracts/` directory. These contracts manage the POS system, handle various tokens, and enable transactions. You can review and modify these contracts as needed.

## Frontend

The frontend of the DApp is built using Vite and React. This is where you can find the user interface for your multi-token Point of Sale system. You can customize the UI to match your specific needs.

## Deployment

1. Create a `.env` file in the root directory with the following environment variables:

```bash
VITE_ALCHEMY_API_KEY=`<Your Alchemy API Key>`
PRIVATE_KEY=`<Your Private Key>``
```

Make sure to replace `<Your Alchemy API Key>` and `<Your Private Key>` with your actual API key and private key information.

2. Compile and deploy the smart contracts to the Rinkeby test network using Hardhat. Run the following commands:

```bash
npx hardhat compile
npx hardhat deploy --network mumbai
```

3. Start the frontend development server:

```bash
yarn dev
```

This will launch your DApp's frontend on `http://localhost:3030`.

## Usage

 Visit `http://localhost:3030` to interact with the multi-token POS DApp. You can initiate transactions and use various tokens to make purchases.

## Contributing

We welcome contributions to improve this DApp. Feel free to fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

