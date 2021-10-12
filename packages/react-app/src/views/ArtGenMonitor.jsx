import React, { useEffect, useState, useRef } from "react";
import { useContractReader } from "../hooks";
import ArtGen from '../components/ArtGen';
import { getPinyottaInfoForArtGen } from '../utils/pinyottaUtils';

function ArtGenMonitor(props) {
  const {
    availableTokens,
    readContracts,
  } = props;

  const [latestToken, setLatestToken] = useState();

  const pinyottaSupply = useContractReader(readContracts, "Pinyottas", "totalSupply");

  useEffect(async () => {
    if(!readContracts) {
      return;
    }

    if(!pinyottaSupply || pinyottaSupply == 0) {
      return;
    }

    const pinyottaId = pinyottaSupply.toNumber();
    const pinyotta = await getPinyottaInfoForArtGen(readContracts, pinyottaId);
    setLatestToken(pinyotta);
  }, [pinyottaSupply, readContracts]);

  return (
    <div className="ArtGenMonitor">
      { latestToken &&
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          <ArtGen
            tokenId={latestToken.id}
            addressesToBalances={latestToken.addressesToBalances}
            availableTokens={availableTokens}
            emptyTokenNumber={latestToken.emptyTokenNumber}
          />
          {/*
            [1,2,3,4,5,6,7].map(r => {
              return (
                <ArtGen
                  tokenId={r}
                  addressesOfTokensToInclude={latestToken.tokenAddresses}
                  availableTokens={TOKENS}
                  emptyTokenNumber={latestToken.emptyTokenNumber}
                />
              );
            })
          */}
        </div>
      }
    </div>
  );
};

export default ArtGenMonitor;