import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <div className="Header">
      <PageHeader
        title={
          <a href="/" target="_blank" rel="noopener noreferrer">Pinyottas</a>
        }
        subTitle='Generative art NFTs loaded up with ERC-20 tokens'
      />
    </div>
  );
}
