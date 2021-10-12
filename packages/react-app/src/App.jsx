import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import { Menu } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import { Account, Contract, Faucet, GasGauge, Header, Ramp, ArtGen } from "./components";
import { INFURA_ID, NETWORK, NETWORKS, PINYOTTAS_API_URL } from "./constants";
import { Transactor } from "./helpers";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useEventListener,
  useExchangePrice,
  useGasPrice,
  useOnBlock,
  useUserSigner,
} from "./hooks";
import {
  PinyottaPage,
  Gallery,
  Home,
  FAQ,
  ArtGenMonitor,
  ArtGenScanner,
} from "./views";
import Portis from "@portis/web3";
import Fortmatic from "fortmatic";
import Authereum from "authereum";
import { TOKENS, EXTERNAL_CONTRACTS } from './utils/tokens';
import Samples from "./components/Samples";

import "antd/dist/antd.css";
import "./App.scss";

const { ethers } = require("ethers");
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.rinkeby; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = false;
const NETWORKCHECK = true;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
  : null;
const poktMainnetProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider(
      "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
    )
  : null;
const mainnetInfura = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
  : null;
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I )

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

// Coinbase walletLink init
const walletLink = new WalletLink({
  appName: "coinbase",
});

// WalletLink provider
const walletLinkProvider = walletLink.makeWeb3Provider(`https://mainnet.infura.io/v3/${INFURA_ID}`, 1);

// Portis ID: 6255fb2b-58c8-433b-a2c9-62098c05ddc9
/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  network: "mainnet", // Optional. If using WalletConnect on xDai, change network to "xdai" and add RPC info below for xDai chain.
  cacheProvider: true, // optional
  theme: "light", // optional. Change to "dark" for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        bridge: "https://polygon.bridge.walletconnect.org",
        infuraId: INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
          42: `https://kovan.infura.io/v3/${INFURA_ID}`,
          100: "https://dai.poa.network", // xDai
        },
      },
    },
    portis: {
      display: {
        logo: "https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png",
        name: "Portis",
        description: "Connect to Portis App",
      },
      package: Portis,
      options: {
        id: "6255fb2b-58c8-433b-a2c9-62098c05ddc9",
      },
    },
    fortmatic: {
      package: Fortmatic, // required
      options: {
        key: "pk_live_5A7C91B2FC585A17", // required
      },
    },
    "custom-walletlink": {
      display: {
        logo: "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
        name: "Coinbase",
        description: "Connect to Coinbase Wallet (not Coinbase App)",
      },
      package: walletLinkProvider,
      connector: async (provider, options) => {
        await provider.enable();
        return provider;
      },
    },
    authereum: {
      package: Authereum, // required
    },
  },
});

function App(props) {
  const mainnetProvider =
    poktMainnetProvider && poktMainnetProvider._isProvider
      ? poktMainnetProvider
      : scaffoldEthProvider && scaffoldEthProvider._network
      ? scaffoldEthProvider
      : mainnetInfura;

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userSigner = useUserSigner(injectedProvider);

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, {
    chainId: localChainId,
    externalContracts: EXTERNAL_CONTRACTS,
  });

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  //const writeContracts = useContractLoader(userSigner, { chainId: localChainId });
  const writeContracts = useContractLoader(userSigner, {
    chainId: localChainId,
    externalContracts: EXTERNAL_CONTRACTS,
  });

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  //const mainnetContracts = useContractLoader(mainnetProvider);

  // Then read your DAI balance like:
  /*
  const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
    "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  ]);
  */

  // keep track of a variable from the contract in the local React state:
  //const purpose = useContractReader(readContracts, "YourContract", "purpose");

  // 📟 Listen for broadcast events
  //const mintEvents = useEventListener(readContracts, "Pinyottas", "Mint", localProvider, 1);

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance &&
      yourMainnetBalance &&
      readContracts &&
      writeContracts //&&
      //mainnetContracts
    ) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      console.log("💵 yourMainnetBalance", yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : "...");
      console.log("📝 readContracts", readContracts);
      console.log("🌍 DAI contract on mainnet:", mainnetContracts);
      //console.log("💵 yourMainnetDAIBalance", myMainnetDAIBalance);
      console.log("🔐 writeContracts", writeContracts);
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    yourMainnetBalance,
    readContracts,
    writeContracts,
    //mainnetContracts,
  ]);

  /*
  let networkDisplay = "";
  if (NETWORKCHECK && localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <Button
                  onClick={async () => {
                    const ethereum = window.ethereum;
                    const data = [
                      {
                        chainId: "0x" + targetNetwork.chainId.toString(16),
                        chainName: targetNetwork.name,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpcUrl],
                        blockExplorerUrls: [targetNetwork.blockExplorer],
                      },
                    ];
                    console.log("data", data);

                    let switchTx;
                    // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
                    try {
                      switchTx = await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: data[0].chainId }],
                      });
                    } catch (switchError) {
                      // not checking specific error code, because maybe we're not using MetaMask
                      try {
                        switchTx = await ethereum.request({
                          method: "wallet_addEthereumChain",
                          params: data,
                        });
                      } catch (addError) {
                        // handle "add" error
                      }
                    }

                    if (switchTx) {
                      console.log(switchTx);
                    }
                  }}
                >
                  <b>{networkLocal && networkLocal.name}</b>
                </Button>
                .
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }
  */
 
  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  return (
    <div className="App">
      <Header />
      {/*networkDisplay*/}
      
      <div>
        <Menu style={{ textAlign: "left" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={() => setRoute("/")} to="/">Home</Link>
          </Menu.Item>
          {/*
          <Menu.Item key="/samples">
            <Link onClick={() => setRoute("/samples")} to="/samples">Sample Pinyottas</Link>
          </Menu.Item>
          */}
          <Menu.Item key="/gallery">
            <Link onClick={() => setRoute("/gallery")} to="/gallery">Gallery</Link>
          </Menu.Item>
          <Menu.Item key="/faq">
            <Link onClick={() => setRoute("/faq")} to="/faq">FAQ</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            <Home
              userSigner={userSigner}
              readContracts={readContracts}
              writeContracts={writeContracts}
              onConnectClick={loadWeb3Modal}
            />
          </Route>
          <Route path="/samples">
            <Samples />
          </Route>
          <Route path="/faq">
            <FAQ/>
          </Route>
          <Route path="/pinyottas/:pinyottaUrlSlug"
            render={({ match }) => {
              return (
                <PinyottaPage
                  address={address}
                  pinyottaId={parseInt(match.params.pinyottaUrlSlug)}
                  readContracts={readContracts}  
                  writeContracts={writeContracts}
                />
              );
            }}>
            
          </Route>

          {/*
          <Route path="/adv">
            <Menu selectedKeys={[route]} mode="horizontal">
              <Menu.Item key="/adv/gld-token">
                <Link onClick={() => setRoute("/adv/gld-token")} to="/adv/gld-token">GLDToken</Link>
              </Menu.Item>
              <Menu.Item key="/adv/slv-token">
                <Link onClick={() => setRoute("/adv/slv-token")} to="/adv/slv-token">SLVToken</Link>
              </Menu.Item>
              <Menu.Item key="/adv/brz-token">
                <Link onClick={() => setRoute("/adv/brz-token")} to="/adv/brz-token">BRZToken</Link>
              </Menu.Item>
              <Menu.Item key="/adv/pinyottas">
                <Link onClick={() => setRoute("/adv/pinyottas")} to="/adv/pinyottas">Pinyottas</Link>
              </Menu.Item>
              <Menu.Item key="/adv/BaseURIMetadataProvider">
                <Link onClick={() => setRoute("/adv/BaseURIMetadataProvider")} to="/adv/BaseURIMetadataProvider">BaseURIMetadataProvider</Link>
              </Menu.Item>
              <Menu.Item key="/adv/hints">
                <Link onClick={() => setRoute("/adv/hints")} to="/adv/hints">Hints</Link>
              </Menu.Item>
              <Menu.Item key="/adv/exampleui">
                <Link onClick={() => setRoute("/adv/exampleui")} to="/adv/exampleui">ExampleUI</Link>
              </Menu.Item>
              <Menu.Item key="/adv/mainnetdai">
                <Link onClick={() => setRoute("/adv/mainnetdai")} to="/adv/mainnetdai">Mainnet DAI</Link>
              </Menu.Item>
              <Menu.Item key="/adv/subgraph">
                <Link onClick={() => setRoute("/adv/subgraph")} to="/adv/subgraph">Subgraph</Link>
              </Menu.Item>
              <Menu.Item key="/adv/artgen">
                <Link onClick={() => setRoute("/adv/artgen")} to="/adv/artgen">ArtGen</Link>
              </Menu.Item>
              <Menu.Item key="/adv/artgen-scanner">
                <Link onClick={() => setRoute("/adv/artgen-scanner")} to="/adv/artgen-scanner">ArtGen Scanner</Link>
              </Menu.Item>
              <Menu.Item key="/adv/gallery">
                <Link onClick={() => setRoute("/adv/gallery")} to="/adv/gallery">Gallery</Link>
              </Menu.Item>
            </Menu>
          </Route>
          */}
        </Switch>
      </div>

      <Switch>
        <Route exact path="/adv/gld-token">
          <Contract
            name="GLDToken"
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
          />
        </Route>
        <Route exact path="/adv/slv-token">
          <Contract
            name="SLVToken"
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
          />
        </Route>
        <Route exact path="/adv/brz-token">
          <Contract
            name="BRZToken"
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
          />
        </Route>
        <Route exact path="/adv/pinyottas">
          <Contract
            name="Pinyottas"
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
          />
        </Route>
        <Route exact path="/adv/BaseURIMetadataProvider">
          <Contract
            name="BaseURIMetadataProvider"
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
          />
        </Route>
        {/*
        <Route path="/adv/hints">
          <Hints
            address={address}
            yourLocalBalance={yourLocalBalance}
            mainnetProvider={mainnetProvider}
            price={price}
          />
        </Route>
        */}
        {/*
        <Route path="/exampleui">
          <ExampleUI
            address={address}
            userSigner={userSigner}
            mainnetProvider={mainnetProvider}
            localProvider={localProvider}
            yourLocalBalance={yourLocalBalance}
            price={price}
            tx={tx}
            writeContracts={writeContracts}
            readContracts={readContracts}
            purpose={purpose}
            setPurposeEvents={setPurposeEvents}
          />
        </Route>
        */}
        <Route path="/adv/mainnetdai">
          {/*
          <Contract
            name="UNI"
            customContract={mainnetContracts && mainnetContracts.contracts && mainnetContracts.contracts.UNI}
            signer={userSigner}
            provider={mainnetProvider}
            address={address}
            blockExplorer="https://etherscan.io/"
          />
          */}
        </Route>
        {/*
        <Route path="/adv/subgraph">
          <Subgraph
            subgraphUri={props.subgraphUri}
            tx={tx}
            writeContracts={writeContracts}
            mainnetProvider={mainnetProvider}
          />
        </Route>
        */}
        <Route path="/adv/artgen">
          <ArtGenMonitor
            readContracts={readContracts}
            availableTokens={TOKENS}
          />
        </Route>
        <Route path="/adv/artgen-scanner">
          {!readContracts &&
            <div>Connect to web3 to activate the ArtGenScanner</div>
          }
          { readContracts &&
            <ArtGenScanner
              readContracts={readContracts}
              availableTokens={TOKENS}
            />
          }
        </Route>
        <Route path="/gallery">
          <Gallery readContracts={readContracts} />
        </Route>
      </Switch>

      {/* 👨‍💼 Your account is in the top right with a wallet and connect options */}
      <div style={{
        position: "fixed",
        textAlign: "right",
        right: 0,
        top: 0,
        padding: 18,
        backgroundColor: 'white',
      }}>
        <Account
          address={address}
          localProvider={localProvider}
          userSigner={userSigner}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
      </div>
    </div>
  );
}

export default App;
