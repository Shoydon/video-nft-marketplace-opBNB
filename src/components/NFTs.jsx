import React, { useEffect, useState } from 'react'
import Cards from './Cards'
import PlayerCard from './PlayerCard';
import contractData from '../contract.json'
import { ethers } from 'ethers';


// import { toast } from 'react-toastify';

function NFTs({ marketplace, setMarketplace, account, setNFTitem }) {

  const [commission, setCommission] = useState(0);

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const loadMarketplaceItems = async () => {
    // console.log("contract in nfts", marketplace);
    if (marketplace === null) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      let marketplaceAddress = contractData.address;
      const marketplacecontract = new ethers.Contract(
        marketplaceAddress,
        contractData.abi,
        signer
      );
      console.log(marketplace);
      setMarketplace(marketplacecontract);
      const comm = Number(await marketplacecontract.commission.call());
      console.log(comm);
      setCommission(comm);
      setCommission(comm);
      console.log(commission);
      setLoading(false)
    }
    const comm = Number(await marketplace.commission.call());
    // console.log(comm);
    setCommission(comm);
    setCommission(comm);
    // console.log(commission);
    const itemCount = Number(await marketplace.fileCount.call())
    console.log("count: "+itemCount);
    
    // console.log("item count", itemCount);

    let displayItems = [];
    let items = await marketplace.viewFiles();

    // console.log("items: ", items);
    // console.log(itemCount);
    for (let i = 0; i < itemCount; i++) {
      const item = items[i]
      // console.log("item: ", item);
      console.log(item);
      const uri = await item.ipfsHash

      const response = await fetch(uri)
      const metadata = await response.json()
      displayItems.push(metadata)

    }
    setLoading(false)
    setItems(displayItems)
    // console.log("type: ", typeof (items));
  }

  // const buyMarketItem = async (item) => {
  //  const tx = await (await marketplace.viewitem(item.itemId, { value: 0 }))

  //  toast.info("Wait till transaction Confirms....", {
  //   position: "top-center"
  // })

  // await tx.wait();

  //   setNFTitem(item)
  //   item.viewitem =true;
  // }



  useEffect(() => {
    loadMarketplaceItems()
  }, [])

  // if (loading) return (
  //   <main style={{ padding: "1rem 0" }}>
  //     <h2 className='text-white font-bold pt-24 text-2xl text-center'>Loading...</h2>
  //   </main>
  // )

  const buyMarketItem = () => { }
  let [currNft, setCurrNft] = useState(null);
  let [player, setPlayer] = useState(false);

  return (
    <>
      <div className='flex flex-wrap gradient-bg-welcome   gap-10 justify-center pt-24 pb-5 px-16'>
        {player && (
          // <div className='flex flex-wrap gradient-bg-welcome   gap-10 justify-center pt-24 pb-5 px-16'>

          // </div>
          <div style={{
            width: '650px',
            height: 'auto',
            // backgroundColor: "#ddd",
            margin: '0 auto',
            display: 'block',
            // justifyContent:'center'
          }}>
            {/* <PlayerCard item={currNft} player={player}/> */}
            <div className='audio-outer'>
              <div className='audio-inner'>
                <PlayerCard item={currNft} player={player} setPlayer={setPlayer} setCurrNft={setCurrNft} currNft={currNft} />
              </div>
            </div>
          </div>
        )}
        {
          (items.length > 0 ?
            items.map((item, idx) => (
              <Cards item={item} currNft={currNft} player={player} setPlayer={setPlayer} setCurrNft={setCurrNft} account={account} idx={idx} commission={commission}/>
            ))

            : (
              <main style={{ padding: "1rem 0" }}>
                <h2 className='text-white'>No listed assets</h2>
              </main>
            ))}
      </div>
    </>
  )
}

export default NFTs