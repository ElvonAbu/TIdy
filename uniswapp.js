const { ethers } = require('ethers');
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json');
const { abi: SwapRouterABI } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');
const abiexact=[
    {
        "inputs": [
          {
            "components": [
              { "internalType": "address", "name": "tokenIn", "type": "address" },
              { "internalType": "address", "name": "tokenOut", "type": "address" },
              { "internalType": "uint24", "name": "fee", "type": "uint24" },
              { "internalType": "address", "name": "recipient", "type": "address" },
              { "internalType": "uint256", "name": "deadline", "type": "uint256" },
              { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
              { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" },
              { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
            ],
            "internalType": "struct ISwapRouter.ExactInputSingleParams",
            "name": "params",
            "type": "tuple"
          }
        ],
        "name": "exactInputSingle",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountOut",
            "type": "uint256"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      }
]
const { getPoolImmutables, getPoolState } = require('./helpers');
const ERC20ABI = require('./abi.json');
require('dotenv').config();

const INFURA_URL_TESTNET = process.env.infuraurl;
const WALLET_ADDRESS = process.env.walletaddress;
const WALLET_SECRET = process.env.privatekey;

const provider = new ethers.JsonRpcProvider(INFURA_URL_TESTNET);
const poolAddress = "0x4585fe77225b41b697c938b018e2ac67ac5a20c0"; // WBTC/WETH
const swapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

const address0 = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'; // WBTC
const decimals0 = 8;

async function main() {
  try {
    const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
    const immutables = await getPoolImmutables(poolContract);
    const state = await getPoolState(poolContract);

    const wallet = new ethers.Wallet(WALLET_SECRET);
    const connectedWallet = wallet.connect(provider);

    const swapRouterContract = new ethers.Contract(swapRouterAddress, abi, provider);

    const inputAmount = 0.001; // Amount to swap
    const amountIn = ethers.parseUnits(inputAmount.toString(), decimals0);

    const approvalAmount  = amountIn * 100000n;
    const tokenContract0 = new ethers.Contract(address0, ERC20ABI, provider);

    // Approve tokens for the swap
    await tokenContract0.connect(connectedWallet).approve(swapRouterAddress, approvalAmount);
    console.log('Token approved successfully.');

    // Swap parameters
    const params = {
      tokenIn: immutables.token1,
      tokenOut: immutables.token0,
      fee: immutables.fee,
      recipient: WALLET_ADDRESS,
      deadline: Math.floor(Date.now() / 1000) + (60 * 10), // 10 minutes from now
      amountIn: amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };

    // Execute the swap
    const gasLimit = await swapRouterContract.connect(connectedWallet).estimateGas.exactInputSingle(params);
    const transactionResponse = await swapRouterContract.connect(connectedWallet).exactInputSingle(
      params,
      { gasLimit }
    );

    console.log('Transaction submitted:', transactionResponse.hash);

    const receipt = await transactionResponse.wait();
    console.log('Transaction confirmed:', receipt);
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main();
