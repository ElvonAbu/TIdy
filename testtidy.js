const { ethers } = require('ethers');
const axios = require("axios");

async function fetchPools() {
  const query = `
    {
      pools(first: 5) {
        id
        token0 {
          id
          symbol
          name
        }
        token1 {
          id
          symbol
          name
        }
        liquidity
        volumeUSD
      }
    }
  `;

  const response = await axios.post('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',{Query:query});

  const data = await response.json();
  console.log(data.data.pools);
}

fetchPools();
