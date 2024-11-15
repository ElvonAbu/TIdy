const {ethers}=require("ethers");
require('dotenv').config();
const privatekey=process.env.privatekey;
const infuraurl=process.env.infuraurl;
const amt=ethers.parseEther('0.0001');
const provider=new ethers.JsonRpcProvider(infuraurl);
const destadd='0x963cA95751bFa23abB796Bba1Bbc704e85108D15';
const wallet=new ethers.Wallet(privatekey,provider);

const main=async ()=>{
try{
  const tx = await wallet.sendTransaction({
    to: destadd,
    value: amt
  });

  const transaction = await tx.wait();
  console.log("this is the transaction:",transaction.hash);

}
catch(error){
console.log("this is the error:",error);

}
};

main();
