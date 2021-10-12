import React, { useEffect, useState, useRef } from "react";
import { Button, Modal } from "antd";
import { TOKENS } from '../utils/tokens';
import ArtGen from '../components/ArtGen';
import { getPinyottaInfoForArtGen } from '../utils/pinyottaUtils';
const { ethers } = require("ethers");

import './PinyottaPage.scss';

function PinyottaPage(props) {
  const {
    address,
    pinyottaId,
    writeContracts,
    readContracts,
  } = props;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pinyotta, setPinyotta] = useState();
  const [contentsString, setContentsString] = useState("");
  const [owner, setOwner] = useState();
  const [isBusted, setIsBusted] = useState(false);
  const recepientInput = useRef();


  useEffect(async () => {
    if(!writeContracts) {
      return;
    }

    const pinyotta = await getPinyottaInfoForArtGen(writeContracts, pinyottaId);
    const owner = (await writeContracts.Pinyottas.ownerOf(pinyottaId));
    const isBusted = (await writeContracts.Pinyottas.isBusted(pinyottaId));

    const tokenObjectsForPinyotta = TOKENS.filter(t => {
      const tokenAddresses = Object.keys(pinyotta.addressesToBalances);
      const lCaseAddresses = tokenAddresses.map(addr => addr.toLowerCase());
      return lCaseAddresses.includes(t.address.toLowerCase());
    });
    
    console.log("Roger")
    let contents = tokenObjectsForPinyotta.map(token => {
      const tokenInfo = TOKENS.find(t => t.address.toLowerCase() === token.address.toLowerCase());
      const amount = ethers.utils.formatUnits(pinyotta.addressesToBalances[token.address], tokenInfo.decimals);
      return amount + " " + token.name;
    });
    let c = "Contents: " + contents.join(" + ");
    setContentsString(c);
    
    setPinyotta(pinyotta);
    setOwner(owner);
    setIsBusted(isBusted);
    
  }, [pinyottaId, readContracts]);

  const handleBustClick = async () => {
    const tx = await writeContracts.Pinyottas.bust(pinyotta.id);
     tx.wait(1).then(() => {
      window.location.reload(false);
    });
  };

  const handleTransferClick = async () => {
    setIsModalVisible(true);
  }

  const handleOk = async () => {
    if(!recepientInput.current.value) {
      return;
    }

    const tx = await writeContracts.Pinyottas.transferFrom(owner, recepientInput.current.value, pinyotta.id);
     tx.wait(1).then(() => {
      window.location.reload(false);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  return (
    <div className="PinyottaPage">
      { pinyotta &&
        <>
        <div className="container">
          <header>
            <h1>Pinyotta #{pinyotta.id}</h1>
            <div>Owned by {owner} {owner === address ? '(you)' : ''}</div>
            <div className="contents">
              <span>{contentsString}</span>
            </div>
          </header>
          <ArtGen
            tokenId={pinyotta.id}
            addressesToBalances={pinyotta.addressesToBalances}
            availableTokens={TOKENS}
            emptyTokenNumber={pinyotta.emptyTokenNumber}
            uploadResults={false}
          />
          { isBusted &&
            <div>The owner of this pinyotta has busted it open and claimed its tokens! It is no longer transferrable.</div>
          }
          { !isBusted && address === owner &&
            <div className="buttons">
              <Button type="primary" onClick={handleTransferClick}>Transfer</Button>
              <Button type="danger" onClick={handleBustClick}>Bust Pinyotta</Button>
            </div>
          }
        </div>
        <Modal title="Transfer pinyotta" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
          <p>Send pinyotta #{pinyotta.id} to:</p>
          <input ref={recepientInput} id="recepient-input" />
        </Modal>
        </>
      }
    </div>
  );
};

export default PinyottaPage;