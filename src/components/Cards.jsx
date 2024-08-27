import React, { useEffect, useState } from 'react'
import Fluid from "../assets/Fluid.png"
import Flower from "../assets/Flower.png"
import Ethereum from "../assets/Ethereum.svg"
import { ethers } from 'ethers'
import { Link } from 'react-router-dom'
import '../App.css';

import { toast } from 'react-toastify'
import contractData from '../contract.json'


function Cards({ item, currNft, player, setPlayer, setCurrNft, account, idx, commission }) {

  // let showPopup = false;

  // function handleOpen() {
  //   showPopup = true;
  // }
  // const [commission, setCommission] = useState(0);
  // useEffect(() => {
  //   async function getCommission() {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     await provider.send("eth_requestAccounts", []);
  //     const signer = provider.getSigner();
  //     let marketplaceAddress = contractData.address;
  //     const marketplacecontract = new ethers.Contract(
  //       marketplaceAddress,
  //       contractData.abi,
  //       signer
  //     );

  //     setCommission(Number(await marketplacecontract.commission.call()));
  //     setCommission(Number(await marketplacecontract.commission.call()));
  //     console.log(commission);
  //     // console.log(typeof((item.price * (1 + commission/100)).toFixed(8)));
  //     const totalPrice = item.price * (1 + commission / 100);
  //     const roundedTotalPrice = Math.round(totalPrice * 10**10) / 10**10; // Round to 6 decimal places
  //     console.log(roundedTotalPrice);

  //   }
  //   getCommission()
  // }, [])

  async function handlePayment(item) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      let marketplaceAddress = contractData.address;
      const marketplacecontract = new ethers.Contract(
        marketplaceAddress,
        contractData.abi,
        signer
      );
      console.log(marketplacecontract);
      const commission = Number(await marketplacecontract.commission.call());
      const rawPrice = (item.price * (1 + commission / 100))
      // const rawPrice = (item.price)
      const payablePrice = Math.round(rawPrice * 10**10) / 10**10
      console.log(payablePrice);
      
      
      const price = ethers.utils.parseEther((payablePrice).toString());
      console.log("price to pay: " + price);
      const tx = await marketplacecontract.watchVideo(idx, {
        value: (price) // Assuming you have apartment price
      });      // Send the transaction (assuming signer has sufficient funds)
      const receipt = await tx.wait();

      await tx.wait();
      toast.success("Transaction successful!", { position: "top-center" })
      console.log("Transaction successful:", receipt);
      setPlayer(true);
      setCurrNft(item)
      return receipt.transactionHash;

    } catch (error) {
      console.log(error);

    }
  }

  return (
    <div className='card-div'>
      <div className='card-inner p-2'>
        <img src={item.image} alt="" className='object-cover w-[230px] h-[230px] rounded overflow-hidden' />
        <div className='flex flex-col justify-center items-center'>
          <h3 className='text-white text-2xl font-thin mt-3'>{item.name}</h3>
          <h4 className='text-white text-2xl font-thin mt-3'>Price: {Math.round(( item.price * (1 + commission / 100)) * 10**10) / 10**10} tBNB</h4>
          {/* <h4 className='text-white text-2xl font-thin mt-3'>Price: {(item.price * (1 + commission / 100)).toFixed(8)} tBNB</h4> */}
          <p className='text-white text-2xl font-thin mt-3 p-2'>{item.description}</p>
          <div className='flex text-white justify-between items-center mb-3 gap-4 mt-3'>
            {/* {item.viewitem ? <Link as={Link} to="/info">
              <button type="button" class="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded text-sm px-5 py-1.5 text-center me-2 ">View</button>
            </Link> :
              <button type="button" class="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded text-sm px-5 py-1.5 text-center me-2 ">Hear Audio</button>
            } */}
            {!player &&
              <button type="button" class="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded text-sm px-5 py-1.5 text-center me-2 " onClick={() => { handlePayment(item) }}>Watch Video</button>
            }
          </div>
        </div>

      </div>
    </div>
  )
}

export default Cards