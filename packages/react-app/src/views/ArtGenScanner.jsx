import React, { useEffect, useState, useRef } from "react";
import { PINYOTTAS_API_URL } from "../constants";
import ArtGen from '../components/ArtGen';
import { getPinyottaInfoForArtGen } from '../utils/pinyottaUtils';

function ArtGenScanner(props) {
  const {
    availableTokens,
    readContracts,
  } = props;

  if(!readContracts) {
    return;
  }

  const [totalSupply, setTotalSupply] = useState();
  const [idsToProcess, setIDsToProcess] = useState([]);
  const [currentPinyotta, setCurrentPinyotta] = useState();
  const ref = useRef();

  async function checkTokenStatus() {
    // If the component isn't on the DOM anymore, don't process any more
    if(!ref.current) {
      return;
    }

    const totalSupply = (await readContracts.Pinyottas.totalSupply()).toNumber();
    setTotalSupply(totalSupply);
    if(totalSupply === 0) {
      setTimeout(checkTokenStatus, 60000);
      return;
    }
    
    const response = await fetch(`${PINYOTTAS_API_URL}/token-status?start=1&end=${totalSupply}`);
    const json = await response.json();
    
    const idsWithMissingInfo = json.filter(record => !record.hasMetadata || !record.hasImage).map(record => record.id);
    setIDsToProcess(idsWithMissingInfo);
    if(idsWithMissingInfo.length > 0) {
      const id = idsWithMissingInfo[0];
      const pinyotta = await getPinyottaInfoForArtGen(readContracts, id);
      setCurrentPinyotta(pinyotta);
    } else {
      setTimeout(checkTokenStatus, 10000);
    }
  }

  useEffect(() => {
    checkTokenStatus();
  }, [readContracts]);

  function handleArtGenUploadComplete() {
    setTimeout(checkTokenStatus, 1);
  }

  return (
    <div
      ref={ref}
      className="ArtGenWrapper"
      style={{
        border: '1px solid black',
        display: 'inline-block',
        padding: '20px'
      }}
    >
      <div>ArtGenScanner</div>
      <div>Total supply: {totalSupply}</div>
      { !currentPinyotta &&
        <>
          <div>Nothing to process</div>
        </>
      }
      { currentPinyotta &&
        <>
          <div>{idsToProcess.length} left to process</div>
          <div>Processing ID #{currentPinyotta.id}</div>
          <ArtGen
            tokenId={currentPinyotta.id}
            addressesToBalances={currentPinyotta.addressesToBalances}
            availableTokens={availableTokens}
            emptyTokenNumber={currentPinyotta.emptyTokenNumber}
            uploadResults={true}
            onUploadComplete={handleArtGenUploadComplete}
          />
        </>
      }
    </div>
  );
};

export default ArtGenScanner;