import React, { useEffect, useState } from "react";
import { PINYOTTAS_API_URL } from "../constants";

import './Gallery.scss';

function Gallery(props) {
  const {
    readContracts,
  } = props;

  const [totalSupply, setTotalSupply] = useState(0);

  useEffect(async () => {
    if(!readContracts) {
      return;
    }

    const totalSupply = (await readContracts.Pinyottas.totalSupply()).toNumber();
    setTotalSupply(totalSupply);
  }, [readContracts]);

  const tokenIds = [];
  if(totalSupply > 0) {
    for(let i = 1; i <= totalSupply; i++) {
      tokenIds.push(i);
    }
  }

  return (
    <div className="Gallery">
      { tokenIds.map(id => {
        const pinyottaPageURL = `/pinyottas/${id}`;
        const imgURL = `${PINYOTTAS_API_URL}/tokens/images/${id}`;
        return (
          <div 
            className="item"
            key={id}
          >
            <h1>
              <a href={pinyottaPageURL}>Pinyotta #{id}<br/><img className="pinyotta-img" src={imgURL}/></a>
            </h1>
          </div>
        );
      })}
    </div>
  );
};

export default Gallery;