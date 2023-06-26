const wallet = document.querySelector(".wallet");
const mint = document.querySelector(".Mint");


const EvmChains = window.evmChains;
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
let web3Modal;
let provider;
let balance;
let connectedAddress;


function init() {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          CHAINID: RPC,
        },
        network: "Pulsechain",
      },
    },
  };

  web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: false,
    providerOptions,
  });
}

async function onConnect() {
  try {
    provider = await web3Modal.connect();
  } catch (e) {
    console.log("Could not get a wallet connection", e);
    return;
  }
  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });
  provider.on("chainChanged", (chainId) => {
    fetchAccountData();
  });

  provider.on("networkChanged", (networkId) => {
    fetchAccountData();
  });
  await fetchAccountData();
}

async function fetchAccountData() {
  const web3 = new Web3(provider);
  const chainId = await web3.eth.getChainId();
  console.log("Network: ",chainId);
  console.log("RPC: ", RPC);
  if (chainId !== CHAINID) {
    Swal.fire({
      title: "WRONG NETWORK",
      icon: 'warning',
      text: 'Please connect to '+NETWORK_MODE+' chaind id: '+CHAINID,
      confirmButtonText: 'CONTINUE',
      confirmButtonColor:'black',
      color: 'red',
      background: "black"
    })
    return;
  }
  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  connectedAddress = selectedAccount;
  document.getElementById("mintbtn").innerHTML = 'MINT';  
  Balance(selectedAccount);
  Supply();
  console.log("selected-account", selectedAccount);
}

const Balance = async (address) => {
  const web3 = new Web3(provider);
  const bal = await web3.eth.getBalance(address);
  balance = (bal / 10 ** 18).toFixed(3);
  wallet.classList.add("wallet_btn");
  wallet.innerHTML = `<span>${balance} PLS</span>`;
};

const Supply = async () => {
  const web3 = new Web3(provider);
  let Contract = web3.eth.Contract;
  let contract = new Contract(abi, contractAddress);
  let supply = await contract.methods.totalSupply().call();
  let supplyText = `${supply} / 3,000`;
  document.getElementById("supply_count").textContent = supplyText;
  console.log(supplyText);
};

document.addEventListener("DOMContentLoaded", async () => {
  const web3 = new Web3(new Web3.providers.HttpProvider(RPC))
  const contract = new web3.eth.Contract(abi, contractAddress)
  contract.defaultAccount = '0xDfD14ef940d483d9B961bf635cEFCe77345A708f';
  let supply = await contract.methods.totalSupply().call();
  let supplyText = `${supply} / 3,000`;
  document.getElementById("supply_count").textContent = supplyText;
  console.log(supplyText);
})


const Mint = async () => {
  
  const web3 = new Web3(provider);
  let Contract = web3.eth.Contract;
  let contract = new Contract(abi, contractAddress);

  let tokenSize = document.querySelector(".tokenSize").value;
  let gas = tokenSize * 250000;
  gas = BigInt(gas);
  tokenSize = parseInt(tokenSize);
  let price = await contract.methods.cost().call();
  let total = price * tokenSize;
  total = BigInt(total);
  console.log("Total Cost: ", total, "WEI | ", "Gas Limit: ", gas );


  let totalcost = BigInt(total); // Assuming price is in ETH

//let conversionFactor = BigInt(10) ** BigInt(18);

  if (tokenSize > 0 && tokenSize <= 30) {
    let sendTx = contract.methods.mint(tokenSize).send({
      from: connectedAddress,
      value: totalcost.toString(),
      gas: gas.toString(),
    })
    .then(function(receipt){
      console.log("Receipt: ",receipt)
      let hash = receipt.transactionHash;

      const transferEvents = Array.isArray(receipt.events.Transfer) ? receipt.events.Transfer : [receipt.events.Transfer];
      const tokenIds = transferEvents.map(event => event.returnValues.tokenId);

      console.log('Token IDs:', tokenIds.join(', '));
      
//Use lookrare ipfs gateway for faster loading time.
      Swal.fire({
        title: tokenSize + " Space Apes minted!",
        icon: 'success',
        color: 'white',
        html: `
            Minted: ${tokenIds.join(', ')}
            <br>
              ${tokenIds
                .map(
                  tokenId => `<img src="https://looksrare.mypinata.cloud/ipfs/QmdheM2UEhjs9mStQzGuRfq5SnBaXW6CB5ntvtqFg57wYe/${tokenId}.png" alt="Pulsechain Space Ape# ${tokenId}" width="200" height="200" style="border: 1px solid #ccc;">`
                )
                .join('')}
            <br>
            <a target="_blank" href="https://scan.pulsechain.com/tx/${hash}">
              VIEW ON PULSE SCAN
            </a>`,
        confirmButtonText: 'CONTINUE',
        confirmButtonColor:'black',
        color: '#55ffff',
        background: "black"
      })
    })
    .catch(function(error) {
      console.log(error);
      Swal.fire({
        title: "Transaction failed, please try again.",
        icon: 'error',
        confirmButtonText: 'CONTINUE',
        confirmButtonColor:'black',
        color: '#55ffff',
        background: "black"
      })
    });
    await sendTx;
    if(!sendTx) {
      Swal.fire({
        title: "Fatal Error! Please try again.",
        icon: 'error',
        confirmButtonText: 'CONTINUE',
        confirmButtonColor:'black',
        color: '#55ffff',
        background: "black"
      });
    }
  }
  else {
    Swal.fire({
      title: "Invalid token amount.",
      icon: 'warning',
      confirmButtonText: 'CONTINUE',
      confirmButtonColor:'black',
      color: '#55ffff',
      background: "black"
    });
  }
    Supply();
};

window.addEventListener("load", () => {
  init();
  localStorage.clear()
  sessionStorage.clear()
});

wallet.addEventListener("click", function () {
  if (!connectedAddress) {
    onConnect();
  }
});

mint.addEventListener("click", () => {
  if (balance) {
    Mint();
  } else {
    onConnect();
  }
});

