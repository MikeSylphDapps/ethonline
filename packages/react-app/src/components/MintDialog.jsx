import React from "react";
import { Button, Card } from "antd";
import { CloseCircleOutlined } from '@ant-design/icons';

import "./MintDialog.scss";

function MintDialog(props) {
  const {
    onMintClick,
    onRemoveToken,
    tokensToIncludeInNextMint,
  } = props;

  return (
    <div className="MintDialog">
      <Card title="Step 2: Mint">
        <div className="subtitle">Contents:</div>
        { tokensToIncludeInNextMint.length === 0 &&
          <div className="empty-contents-message">
            <div>Nothing</div><br/>
            <div>Empty pinyottas are no fun. Add some tokens from over there.<br/><div style={{fontSize:'1.5em'}}>⬅️</div><br/></div>
          </div>
        }
        { tokensToIncludeInNextMint.length > 0 &&
          <div className="token-records">
            { tokensToIncludeInNextMint.map(record => {
              const { token, amount } = record;
              return (
                <div className="token-record" key={token.symbol}>
                  <div className="label">{amount.toLocaleString()} {token.symbol}</div>
                  <div
                    title={`Remove ${token.symbol}`}
                  >
                    <CloseCircleOutlined onClick={() => onRemoveToken(token)}/>
                  </div>
                </div>
              )
            })}
          </div>
        }
        <Button type="primary" onClick={onMintClick}>MINT</Button>
      </Card>
    </div>
  );
}

export default MintDialog;