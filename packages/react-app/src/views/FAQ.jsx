import React from "react";

import "./FAQ.scss"

function FAQ() {
  return (
    <div className="FAQ">
      <div style={{
        fontWeight: 'bold',
        padding: '1.5em'
      }}>FAQ</div>
      <div style={{ maxWidth: '600px', textAlign: 'left', margin: '0px auto' }}>
        <p className="q">
          What is an ERC-20 token?
        </p>
        <p className="a">
          ERC-20 is the name of the standard for fungible tokens on Ethereum. So an ERC-20 token is simply a token that complies to that standard.
        </p>
        <p className="a">
          Fungible tokens of the same type all have the same value. BTC, for example, is fungible. You can swap one BTC for another and you still have 1 BTC.
        </p>
        <p className="a">
          Non-fungible tokens adhere to a different standard: ERC-721. These are the ones that you can't exchanged one-for-one because each is unique.
        </p>

        <p className="q">
          What is the point of tying fungible tokens to NFTs?
        </p>
        <p className="a">
          Many people who entered the crypto space because of NFTs do not yet realize there is a rich Defi ecosystem built on top of the ERC-20 standard. Pinyottas are a great way to introduce those users to that world!
        </p>
        <p className="a">
          If that sounds like you, welcome! We're glad you're here!
        </p>

        <p className="q">
          How do I redeem the ERC-20 tokens associated with a pinyotta?
        </p>
        <p className="a">
          Visit the page for your pinyotta, connect your wallet, and look for the "Bust" button.
        </p>
        
        <p className="q">
          Isn't 25,000 items big for an NFT collection?
        </p>
        <p className="a">
          Yes. The hope is with a high number of pinyottas in circulation they will remain accessible to a wider group of buyers for longer than we typically see with smaller collections, thereby helping more people discover the ecosystem built on top of the ERC-20 standard.
        </p>

        <p className="q">
          Why are only certain tokens available to add to a pinyotta?
        </p>
        <p className="a">
          Scams abound in crypto, but Pinyottas should be a safe entry point for newcomers. Having an approved list of tokens prevents someone from deploying a token contract for their own version of a popular token, let's say UNI, that has nothing to do with Uniswap and holds no actual value. If they were to deposit it into a pinyotta, they could scam a buyer by listing the pinyotta "below UNI's market value" and have a nice payday.
        </p>
        <p className="a">
          The unsuspecting buyer would quickly find out that they are out a lot of money and would likely be forever turned off from Defi.
        </p>
        <p className="a">
          That said, if there is a legitimate token that is not yet whitelisted that you think should be, please get in touch.
        </p>
      </div>
    </div>
  );
}

export default FAQ;