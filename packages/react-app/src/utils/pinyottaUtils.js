export const getPinyottaInfoForArtGen = async (readContracts, pinyottaId) => {
  console.log("getPinyottaInfoForArtGen")
  const tokenAddresses = (await readContracts.Pinyottas.getTokenContractsInPinyotta(pinyottaId));

  let emptyTokenNumber;
  let addressesToBalances = null;
  if(tokenAddresses.length === 0) {
    emptyTokenNumber = (await readContracts.Pinyottas.getEmptyTokenNumber(pinyottaId)).toNumber();
  }
  else {
    if(tokenAddresses.length > 0) {
      addressesToBalances = {};
    }
    console.log(tokenAddresses.length)
    for(let i = 0; i < tokenAddresses.length; i++) {
      const tokenAddress = tokenAddresses[i];
      const balance = await readContracts.Pinyottas.getTokenBalanceInPinyotta(pinyottaId, tokenAddress);
      console.log(tokenAddress, balance);
      addressesToBalances[tokenAddress] = balance;
    }
  }

  return {
    id: pinyottaId,
    emptyTokenNumber,
    addressesToBalances,
  };
};