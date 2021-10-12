const ERC20ABI = [
{
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
    {
        name: "",
        type: "string",
    },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
},
{
    constant: false,
    inputs: [
    {
        name: "_spender",
        type: "address",
    },
    {
        name: "_value",
        type: "uint256",
    },
    ],
    name: "approve",
    outputs: [
    {
        name: "",
        type: "bool",
    },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
},
{
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
    {
        name: "",
        type: "uint256",
    },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
},
{
    constant: false,
    inputs: [
    {
        name: "_from",
        type: "address",
    },
    {
        name: "_to",
        type: "address",
    },
    {
        name: "_value",
        type: "uint256",
    },
    ],
    name: "transferFrom",
    outputs: [
    {
        name: "",
        type: "bool",
    },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
},
{
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
    {
        name: "",
        type: "uint8",
    },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
},
{
    constant: true,
    inputs: [
    {
        name: "_owner",
        type: "address",
    },
    ],
    name: "balanceOf",
    outputs: [
    {
        name: "balance",
        type: "uint256",
    },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
},
{
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
    {
        name: "",
        type: "string",
    },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
},
{
    constant: false,
    inputs: [
    {
        name: "_to",
        type: "address",
    },
    {
        name: "_value",
        type: "uint256",
    },
    ],
    name: "transfer",
    outputs: [
    {
        name: "",
        type: "bool",
    },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
},
{
    constant: true,
    inputs: [
    {
        name: "_owner",
        type: "address",
    },
    {
        name: "_spender",
        type: "address",
    },
    ],
    name: "allowance",
    outputs: [
    {
        name: "",
        type: "uint256",
    },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
},
{
    payable: true,
    stateMutability: "payable",
    type: "fallback",
},
{
    anonymous: false,
    inputs: [
    {
        indexed: true,
        name: "owner",
        type: "address",
    },
    {
        indexed: true,
        name: "spender",
        type: "address",
    },
    {
        indexed: false,
        name: "value",
        type: "uint256",
    },
    ],
    name: "Approval",
    type: "event",
},
{
    anonymous: false,
    inputs: [
    {
        indexed: true,
        name: "from",
        type: "address",
    },
    {
        indexed: true,
        name: "to",
        type: "address",
    },
    {
        indexed: false,
        name: "value",
        type: "uint256",
    },
    ],
    name: "Transfer",
    type: "event",
},
];

/*
Others to consider:

SKALE
https://skale.network/token/

RARI
https://rarible.medium.com/introducing-rari-the-first-governance-token-in-the-nft-space-5dbcc55b6c43

1INCH
https://app.1inch.io/#/1/dao/governance

Enzyme's MLN
https://docs.enzyme.finance/tokenomics/mln-token

LPT
https://livepeer.org/tokenholders

MPH
https://88mph.app/

RAD
https://docs.radicle.xyz/docs/connecting-to-ethereum/obtaining-rad

CNJ
https://docs.conjure.finance/protocol/governance

TRB
https://docs.tellor.io/tellor/whitepaper/tellor-token

DXD
https://dxdao.eth.link/#/

UMA
https://docs.umaproject.org/

UMB
https://umb.network/

CQT
https://www.covalenthq.com/

IONX
https://docs.charged.fi/charged-particles-protocol/protocol-governance

MPL
https://maplefinance.gitbook.io/maple/protocol/maple-token-holders

ZKT
https://www.zktube.io/

NEAR
https://near.org/
*/

const getTokens = () => {
  const TOKENS = [
    {
      devAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      mainnetAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      rinkebyAddress: "0x971F469F6E98556d3B24d0427102cD3d6C60Ee91",
      chainId: 1,
      name: "AAVE",
      symbol: "AAVE",
      colors: ["#B6509E", "#2EBAC6"],
      decimals: 18,
    },
    {
      devAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      mainnetAddress: "0xba100000625a3754423978a60c9317c58a424e3D",
      rinkebyAddress: "0x97f74745BdBbBb6b2A7006324afBAB92902eE964",
      decimals: 18,
      chainId: 1,
      name: "BAL",
      symbol: "BAL",
      colors: ["#222222", "#e0e0e0"]
    },
    {
      devAddress: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      mainnetAddress: "0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198",
      rinkebyAddress: "0x84Cef43C9520AA5Bd5844C629eE5Ec6109316AcF",
      decimals: 18,
      chainId: 1,
      name: "BANK",
      symbol: "BANK",
      colors: ["#222222", "#e0e0e0", "#ff0000"]
    },
    {
      devAddress: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      mainnetAddress: "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
      rinkebyAddress: "0xFAdAd9E99226d23afE9d72318249BFCA48156bDf",
      decimals: 18,
      chainId: 1,
      name: "BAT",
      symbol: "BAT",
      colors: ["#FF4724", "#662D91", "#9E1F63"]
    },
    {
      devAddress: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
      mainnetAddress: "0xc00e94cb662c3520282e6f5717214004a7f26888",
      rinkebyAddress: "0x35ee38368Ea7801ACDc5b7B5d213c80987393a45",
      decimals: 18,
      chainId: 1,
      name: "COMP",
      symbol: "COMP",
      colors: ["#00d395"]
    },
    {
      devAddress: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
      mainnetAddress: "0xD533a949740bb3306d119CC777fa900bA034cd52",
      rinkebyAddress: "0x574d3C57eB8FbED4473f1e8f39a6991B0d0257f0",
      decimals: 18,
      chainId: 1,
      name: "CRV",
      symbol: "CRV",
      colors: ["#800000", "#FFDB00", "#3cffba", "#0014ff"]
    },
    {
      devAddress: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
      mainnetAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
      rinkebyAddress: "0xb99223E5b7604F9e7c547fdEC6AFEe8117a7940c",
      decimals: 18,
      chainId: 1,
      name: "DAI",
      symbol: "DAI",
      colors: ["#f4b731"]
    },
    {
      devAddress: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
      mainnetAddress: "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b",
      rinkebyAddress: "0x504DdF8Df0209f132E147E3E8FE2fe8E7a02BEC9",
      decimals: 18,
      chainId: 1,
      name: "DPI",
      symbol: "DPI",
      colors: ["#3A056C", "#4D078D"]
    },
    {
      devAddress: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
      mainnetAddress: "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b",
      rinkebyAddress: "0x1205f6ff3D8089a9C400e2d1127B92d271129F36",
      decimals: 18,
      chainId: 1,
      name: "GLM",
      symbol: "GLM",
      colors: ["#181ea9", "#404b63", "#a2a3b9"]
    },
    {
      devAddress: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
      mainnetAddress: "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
      rinkebyAddress: "0x1648BB6EC804B0A703B4c39f896CE24948659559",
      decimals: 18,
      chainId: 1,
      name: "GRT",
      symbol: "GRT",
      colors: ["#40217f", "#4b89d6"]
    },
    {
      devAddress: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
      mainnetAddress: "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f",
      rinkebyAddress: "0xc52a9C93b258E96f5Ffe34571b99c3C49952Cf81",
      decimals: 18,
      chainId: 1,
      name: "GTC",
      symbol: "GTC",
      colors: ["#0fce7c", "#6F3FF5", "#222222"]
    },
    {
      devAddress: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
      mainnetAddress: "0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb",
      rinkebyAddress: "0xE6f6fE4CE75c0311B236F7C4bc8d605ce3eb8d08",
      decimals: 18,
      chainId: 1,
      name: "INST",
      symbol: "INST",
      colors: ["#3f75ff", "#e0e0e0"]
    },
    {
      devAddress: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
      mainnetAddress: "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
      rinkebyAddress: "0x0896d99758c0FCE83f19619C7776B4CF033F483C",
      decimals: 18,
      chainId: 1,
      name: "LIDO",
      symbol: "LIDO",
      colors: ["#53f5f8", "#4a8cea", "#ffe337", "#fe7f78"]
    },
    {
      devAddress: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
      mainnetAddress: "0x514910771af9ca656af840dff83e8264ecf986ca",
      rinkebyAddress: "0x6894ADcCd955CaafcB537689C6Fa8931e426E45a",
      decimals: 18,
      chainId: 1,
      name: "LINK",
      symbol: "LINK",
      colors: ["#375bd2", "#e0e0e0"]
    },
    {
      devAddress: "0x9A676e781A523b5d0C0e43731313A708CB607508",
      mainnetAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
      rinkebyAddress: "0x88A478bE49507f73ED3DFe14900Ec76fa65D6BA1",
      decimals: 18,
      chainId: 1,
      name: "MATIC",
      symbol: "MATIC",
      colors: ["#8247e5"]
    },
    {
      devAddress: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
      mainnetAddress: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
      rinkebyAddress: "0x18A9021e924008c4f1E871DBdC08dDC34C92Ab3F",
      decimals: 18,
      chainId: 1,
      name: "MKR",
      symbol: "MKR",
      colors: ["#1AAB9B"]
    },
    {
      devAddress: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1",
      mainnetAddress: "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919",
      rinkebyAddress: "0xaBD3e878D19A44b6c423d19E95Ca658BcE05D620",
      decimals: 18,
      chainId: 1,
      name: "RAI",
      symbol: "RAI",
      colors: ["#4ce096", "#78d8ff"]
    },
    {
      devAddress: "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
      mainnetAddress: "0xb4efd85c19999d84251304bda99e90b92300bd93",
      rinkebyAddress: "0x53fc1C641a2AD3ea5b0319d562E080efB4284338",
      decimals: 18,
      chainId: 1,
      name: "RPL",
      symbol: "RPL",
      colors: ["#ffbb72", "#ff5e6d"]
    },
    {
      devAddress: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
      mainnetAddress: "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
      rinkebyAddress: "0x6CF7Ce0227d396E66481B9Be1e90aCC6941E51a8",
      decimals: 18,
      chainId: 1,
      name: "SNX",
      symbol: "SNX",
      colors: ["#00d1ff"]
    },
    {
      devAddress: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
      mainnetAddress: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
      rinkebyAddress: "0x91cA491E9E65fce46CF9dc2aC3b34902479E6cf2",
      decimals: 18,
      chainId: 1,
      name: "SUSHI",
      symbol: "SUSHI",
      colors: ["#016eda", "#d900c0"]
    },
    {
      devAddress: "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d",
      mainnetAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      rinkebyAddress: "0x68e0b1e513d0DDb86462995ee867cbd8C28AfD90",
      decimals: 18,
      chainId: 1,
      name: "UNI",
      symbol: "UNI",
      colors: ["#ff007a"]
    },
    {
      devAddress: "0x59b670e9fA9D0A427751Af201D676719a970857b",
      mainnetAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      rinkebyAddress: "0x4A0585EBA1583499cd96eE9b1511daFA916d511b",
      decimals: 18,
      chainId: 1,
      name: "USDC",
      symbol: "USDC",
      colors: ["#2775CA", "#e0e0e0"]
    },
    {
      devAddress: "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1",
      mainnetAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      rinkebyAddress: "0xCAF1c1210de690d937720AEC828810091a406d46",
      decimals: 8,
      chainId: 1,
      name: "WBTC",
      symbol: "WBTC",
      colors: ["#f09242", "#e0e0e0"]
    },
    {
      devAddress: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
      mainnetAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      rinkebyAddress: "0xf77b277e8A6eE1E1AA10E2EAB935B3A52A70976B",
      decimals: 18,
      chainId: 1,
      name: "WETH",
      symbol: "WETH",
      colors: ["#c83177", "#e29bc6"]
    },
    {
      devAddress: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
      mainnetAddress: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
      rinkebyAddress: "0x79540c6C9c930Ac6e6794a4c69B9fEaA794FADCE",
      decimals: 18,
      chainId: 1,
      name: "YFI",
      symbol: "YFI",
      colors: ["#006ae3", "#1f255f", "#e0e0e0"]
    },
    {
      devAddress: "0x4A679253410272dd5232B3Ff7cF5dbB88f295319",
      mainnetAddress: "0xe41d2489571d322189246dafa5ebde1f4699f498",
      rinkebyAddress: "0x963fC75e0fBDD5Fc6C9D95fA8865e7c988331d7a",
      decimals: 18,
      chainId: 1,
      name: "ZRX",
      symbol: "ZRX",
      colors: ["#222222", "#e0e0e0"]
    },
  ];
  
  TOKENS.forEach(token => {
    //token.address = token.devAddress;
    token.address = token.rinkebyAddress;
  });
  return TOKENS;
}

const TOKENS = getTokens();


const symbolsToAddressAndABIs = {};
TOKENS.forEach(token => {
  //console.log(token.symbol, token.address)
  symbolsToAddressAndABIs[token.symbol] = {
    address: token.address,
    abi: ERC20ABI
  }
});

//TOKENS = TOKENS.slice(0, 5);

const EXTERNAL_CONTRACTS = {
  31337: {
    contracts: symbolsToAddressAndABIs,
  }
};


module.exports = {
  TOKENS,
  EXTERNAL_CONTRACTS,
};