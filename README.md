# Pinyottas

Pinyottas are NFTs that hold a collection of different fungible assets (a.k.a. ERC-20 tokens), so when a pinyotta is transferred to a new owner, the ERC-20 tokens move along with the pinyotta.

A pinyotta owner can "bust" their pinyotta to transfer the underlying tokens to their address, but this also locks the pinyotta in their account.

Each pinyotta is represented by a piece of deterministic generative art. Certain components of the art are derived from the types of the underlying tokens, but other components are determined randomly by a seed set at mint time.

Start the blockchain:

```
yarn chain
```

Deployy the contarcts to the chain:
```
yarn deploy
```

Start the webpack server
```
yarn start
```

Pinyottas is built using Scaffold-ETH. The original README for Scaffold-ETH is below. Documentation on Scaffold-ETH can be found at: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)
