import React, {
  useRef,
  useState,
} from "react";
import { Button } from "antd";
import {
  useContractReader,
} from "../hooks";
const { ethers } = require("ethers");

import './TokenRow.scss';

function TokenRow(props) {
  const {
    token,
    readContracts,
    writeContracts,    
    address,
    isIncludedInNextMint,
    onAdd,
  } = props;

  const inputRef = useRef();

  const [validationFailed, setValidationFailed] = useState(false);

  let balance = useContractReader(readContracts, token.symbol, "balanceOf", [ address ]);
  if(balance !== undefined) {
    //console.log(balance, balance.toString(), displayBN(balance));
  }

  let allowance = useContractReader(readContracts, token.symbol, "allowance", [ address, writeContracts.Pinyottas.address ]);
  
  //console.log(address, writeContracts.Pinyottas.address)
  //console.log(readContracts[token.symbol].address)
  //console.log(token.symbol, allowance)

  function enable() {
    writeContracts[token.symbol].approve(writeContracts.Pinyottas.address, ethers.BigNumber.from(2).pow(256).sub(1));
  }

  function disable() {
    writeContracts[token.symbol].approve(writeContracts.Pinyottas.address, 0);
  }

  function add() {
    const amount = parseFloat(inputRef.current.value);

    if(isNaN(amount)) {
      setValidationFailed(true);
      return;
    }

    if(amount < 0 || amount > balance) {
      setValidationFailed(true);
      return;
    }

    onAdd(token, amount);
  }

  const addButtonText = isIncludedInNextMint ? "Update" : "Add";

  let extraClassName = "";
  if(allowance !== undefined && allowance === 0) {
    extraClassName = "unapproved";
  } else if(allowance !== undefined && allowance > 0) {
    extraClassName = "approved";
  }

  return (
    <div className="TokenRow">
      <div className={'wrap ' + extraClassName}>
        <div className="col col-1">
          <div className="symbol">{token.symbol}</div>
        </div>
        <div className="col col-2">
          { allowance === undefined &&
            <div>Loading...</div>
          }
          { allowance !== undefined && allowance.eq(0) &&
            <div className="unapproved">
              <div className="balance">
                <div className="label">Wallet balance</div>
                <div className="value">{balance !== undefined && ethers.utils.formatUnits(balance, token.decimals)}</div>
              </div>
            </div>
          }
          { allowance !== undefined && allowance.gt(0) &&
            <div className="approved">
              <div className="balance">
                <div className="label">Wallet balance</div>
                <div className="value">{balance !== undefined && ethers.utils.formatUnits(balance, token.decimals)}</div>
              </div>
              <div>
                <input
                  ref={inputRef}
                  className={validationFailed ? 'validation-failed' : ''}
                  type="number"
                  onChange={() => setValidationFailed(false)}
                />
              </div>
            </div>
          }
        </div>
        <div className="col col-3">
          { balance !== undefined &&
            <>
              { balance.eq(0) &&
                <a
                  href={`https://app.uniswap.org/#/swap?outputCurrency=${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button type="secondary">Get {token.symbol}</Button>  
                </a>
              }
              { balance.gt(0) && allowance !== undefined && allowance.eq(0) &&
                <Button type="primary" onClick={enable}>Enable</Button>
              }
              { balance.gt(0) &&  allowance !== undefined && allowance.gt(0) &&
                <div>
                  <Button type="primary" onClick={add}>{addButtonText} &rarr;</Button>
                  {/*<Button type="primary" onClick={disable}>Disable</Button>*/}
                </div>
              }
            </>
          }
        </div>
      </div>
    </div>
  )
}

export default TokenRow;