import React from "react";

function ProjectDescription() {
  return (
    <div className="ProjectDescription" style={{marginBottom: '2em'}}>
      <div className="title">Pinyottas put  the "fungible" into "non-fungible tokens"</div>
      <div style={{ maxWidth: '600px', textAlign: 'left', margin: '0px auto' }}>
        <p>Pinyottas are NFTs that hold a collection of different fungible assets (a.k.a. ERC-20 tokens), so when a pinyotta is transferred to a new owner, the ERC-20 tokens move along with the pinyotta.</p>
        <p>A pinyotta owner can "bust" their pinyotta to transfer the underlying tokens to their address, but this also locks the pinyotta in their account.</p>
        <p>Each pinyotta is represented by a piece of deterministic generative art. Certain components of the art are derived from the types of the underlying tokens, but other components are determined randomly by a seed set at mint time.</p>
        <p>Some sample outputs of the Pinyottas algorithm are below.</p>
        {/*<p>Before you mint a pinyotta, you'll need to set an approval for the Pinyottas contract to interact with the ERC-20 tokens you want to include in the pinyotta. Then click mint. The minting fee is 0.08 ETH, and the max supply is 25,000 pinyottas. The large supply is to allow for a wider distribution than most NFT projects.</p>*/}
      </div>
    </div>
  );
}

export default ProjectDescription;