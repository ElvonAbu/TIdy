const { ethers } = require('ethers');
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json');
const { abi: SwapRouterABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');
const { getPoolImmutables, getPoolState } = require('./helpers');
const ERC20ABI = require('./abi.json');
require('dotenv').config();

require('dotenv').config();
const INFURA_URL_TESTNET = process.env.infuraurl;
const WALLET_ADDRESS = process.env.walletaddress;
const WALLET_SECRET = process.env.privatekey;

const provider = new ethers.providers.JsonRpcProvider(INFURA_URL_TESTNET); // Ropsten
const poolAddress = "0x4585fe77225b41b697c938b018e2ac67ac5a20c0"; // WBTC/WETH
const swapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

const name0 = 'Wrapped BTC ';
const symbol0 = 'WBTC  ';
const decimals0 = 8;
const address0 = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';

const name1 = 'Wrapped Ether';
const symbol1 = 'WETH ';
const decimals1 = 18;
const address1 = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

async function main() {
  const poolContract = new ethers.Contract(
    poolAddress,
    IUniswapV3PoolABI,
    provider
  );

  const immutables = await getPoolImmutables(poolContract);
  const state = await getPoolState(poolContract);

  const wallet = new ethers.Wallet(WALLET_SECRET);
  const connectedWallet = wallet.connect(provider);

  const swapRouterContract = new ethers.Contract(
    swapRouterAddress,
    SwapRouterABI,
    provider
  );

  const inputAmount = 0.001;
  // .001 => 1 000 000 000 000 000
  const amountIn = ethers.utils.parseUnits(
    inputAmount.toString(),
    decimals0
  );

  const approvalAmount = (amountIn * 100000).toString();
  const tokenContract0 = new ethers.Contract(
    address0,
    ERC20ABI,
    provider
  );
  const approvalResponse = await tokenContract0.connect(connectedWallet).approve(
    swapRouterAddress,
    approvalAmount
  );

  const params = {
    tokenIn: immutables.token1,
    tokenOut: immutables.token0,
    fee: immutables.fee,
    recipient: WALLET_ADDRESS,
    deadline: Math.floor(Date.now() / 1000) + (60 * 10),
    amountIn: amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  }

  const transaction = swapRouterContract.connect(connectedWallet).exactInputSingle(
    params,
    {
      gasLimit: ethers.utils.hexlify(1000000)
    }
  ).then(transaction => {
    console.log(transaction)
  });
}

main();
