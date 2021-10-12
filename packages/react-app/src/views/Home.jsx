import React, { useEffect, useState } from "react";
import { message, Button, Card } from "antd";
import ProjectDescription from "../components/ProjectDescription";
import MintDialog from "../components/MintDialog";
import TokenRow from "../components/TokenRow";
import { TOKENS } from '../utils/tokens';

import './Home.scss';

const { ethers } = require("ethers");

function Home(props) {
  const {
    userSigner,
    readContracts,
    writeContracts,
    onConnectClick,
  } = props;

  const [address, setAddress] = useState();
  const [tokensToIncludeInNextMint, setTokensToIncludeInNextMint] = useState([]);

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  function addToNextMint(token, amount) {
    const newTokensToIncludeInNextMint = [...tokensToIncludeInNextMint];
    const index = newTokensToIncludeInNextMint.findIndex(record => record.token.address === token.address);
    if(index === -1) { // Token is not already in the list for the next mint
      if(amount !== 0) { // Value is non-zero, so add the token
        newTokensToIncludeInNextMint.push({
          token,
          amount,
        });
      }
    } else { // The token is already in the list for the next mint
      console.log(amount)
      if(amount === 0) { // The value is 0, which means we need to remove it form the list for the next mint
        console.log("need to remove", newTokensToIncludeInNextMint.length)
        newTokensToIncludeInNextMint.splice(index, 1);
        console.log("removed", newTokensToIncludeInNextMint.length)
      } else { // The value is non-zero so update the existing record
        newTokensToIncludeInNextMint[index].amount = amount;
      }
    }
    setTokensToIncludeInNextMint(newTokensToIncludeInNextMint);
  };

  function removeTokenFromNextMint(token) {
    addToNextMint(token, 0);
  }

  async function mint() {
    console.log(tokensToIncludeInNextMint);
    const tokenAddresses = [];
    const tokenAmounts = [];
    for(let i = 0; i < tokensToIncludeInNextMint.length; i++) {
      const tokenInfo = tokensToIncludeInNextMint[i].token;
      const amount = ethers.utils.parseUnits(tokensToIncludeInNextMint[i].amount.toString(), tokenInfo.decimals);
      console.log(amount.toString());
      tokenAddresses.push(tokensToIncludeInNextMint[i].token.address);
      tokenAmounts.push(amount);
    }

    console.log("Minting", tokenAddresses, tokenAmounts);

    try {
      const tx = await writeContracts.Pinyottas.mint(tokenAddresses, tokenAmounts, {
        value: ethers.utils.parseEther(".00001")
        //value: ethers.utils.parseEther(".08")
      });
      //alert("Your transaction has been submitted. Keep this page open, and if the transaction succeeds, a new tab will open where you can view the pinyotta.\n\nFeel free to mint another while you wait.")
      tx.wait(1).then(receipt => {
        if(receipt && receipt.events) {
          for(let i = 0; i < receipt.events.length; i++) {
            const event = receipt.events[i];
            if(event.event === "Mint") {
              const pinyottaId = event.args.id.toNumber();
              message.success(
                <div>
                  <div>You minted pinyotta #{pinyottaId}!</div>
                  <div>
                    <a href={`/pinyottas/${pinyottaId}`} target="_blank">View your pinyotta</a>
                  </div>
                </div>
              );
              break;
            }
          }
        }
      });
    } catch (e) {
      if(e.code === 4001) {
        return;
      }
      if(e && e.data && e.data.message) {
        alert("Your transaction will fail with this error message:\n\n" + e.data.message);
      } else {
        alert("Your transaction will fail but we couldn't determine exactly why. See the JS console for more information");
      }
      console.error(e);
    }
  }

  return (
    <div className="Home">
      <ProjectDescription/>
      <div className="main">
        {!userSigner &&
          <Button type={"primary"} onClick={onConnectClick}>CONNECT YOUR WALLET TO MINT</Button>
        }
        {userSigner &&
          <>
            <Card title="Step 1: Enable tokens and add them to a pinyotta">
              <div className="token-list">
                { writeContracts && TOKENS.map((token, i) => {
                  const isIncludedInNextMint = tokensToIncludeInNextMint.some(r => r.token.address === token.address);
                  return (
                    <TokenRow
                      key={token.symbol + ' ' + i}
                      token={token}
                      address={address}
                      readContracts={readContracts}
                      writeContracts={writeContracts}
                      isIncludedInNextMint={isIncludedInNextMint}
                      onAdd={(token, amount) => addToNextMint(token, amount)}
                    />
                  )
                })}
              </div>
            </Card>

            <MintDialog
              tokensToIncludeInNextMint={tokensToIncludeInNextMint}
              onMintClick={mint}
              onRemoveToken={token => removeTokenFromNextMint(token)}
            />
          </>
        }
      </div>
      <hr/>
      <div className="previews">
        { [1,2,3,4,5,6].map(num => {
          const url = `previews/preview-${num}.svg`;
          return (
            <a key={num} href={url} target="_blank"><img src={url} /></a>
          )
        })}
      </div>
    </div>
  );
}

export default Home;