import React, { useEffect, useState } from 'react'
import { ethers } from "ethers"
import axios from 'axios'
import { toast } from 'react-toastify'
import contractData from '../contract.json'

function Create({ marketplace, account, setMarketplace }) {


  const [nftFile, setNFTFile] = useState();
  const [nftThumbnail, setNftThumbnail] = useState();
  // const [commission, setCommission] = useState(0);
  let thumbnailHash;
  // let [fileType, setFileType] = useState(null);
  const [forminfo, setFormInfo] = useState({
    title: "",
    description: "",
    file: "",
    image: "",
    price: 0,
    owner: ""
  });

  useEffect(() => {
    document.title = "Create"
    // toast.success("NFT added to marketplace successfully", { position: "top-center" })

  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormInfo((prevState) => ({ ...prevState, [name]: value }));
  };

  const changeHandler = (event) => {
    const file = event.target.files[0];
    try {
      console.log("file.type in changehandler: ", file.type);
    } catch (error) {
      console.log(error);
    }
    if (file.type.startsWith('video/')) {
      setNFTFile(file);
    } else {
      alert('Please select a video file.');
      return; // Prevent further processing if not audio/video
    }

  };

  const thumbnailChangeHandler = (e) => {
    const file = e.target.files[0];
    const acceptedImageTypes = ['image/jpeg', 'image/png'];
    if (!acceptedImageTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG or PNG).');
      return; // Prevent further processing if not an image
    } else {
      setNftThumbnail(file)
    }
  }

  const handleEvent = async (e) => {
    e.preventDefault();
    // console.log(nftFile);
    console.log(nftFile);
    console.log(nftThumbnail);
    console.log(forminfo);

    // const jsonformData = new FormData();

    console.log("uploading thumbnail");
    const thumbnailFileData = new FormData();
    thumbnailFileData.append("file", nftThumbnail);
    try {

      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: thumbnailFileData,
        headers: {
          pinata_api_key: `0a13ef76fb9e01561e05`,
          pinata_secret_api_key: `f0a2d096004e4f0483a64d06236ddc252b8d8acf612cde6465bc78f013a08ab0`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(resFile.data);

      thumbnailHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;

    } catch (error) {
      console.log(error);
    }

    console.log("thumbnail uploaded");
    console.log("uploading nft file");

    const nftFileData = new FormData();
    nftFileData.append('file', nftFile);
    try {

      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: nftFileData,
        headers: {
          pinata_api_key: `0a13ef76fb9e01561e05`,
          pinata_secret_api_key: `f0a2d096004e4f0483a64d06236ddc252b8d8acf612cde6465bc78f013a08ab0`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(resFile.data);

      const fileHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      // let fileType;

      const info = {
        name: forminfo.title,
        description: forminfo.description,
        image: thumbnailHash,
        file: fileHash,
        price: forminfo.price,
        owner: account
      }

      async function pinJSONToPinata(info) {
        const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
        const headers = {
          'Content-Type': 'application/json',
          'pinata_api_key': `0a13ef76fb9e01561e05`,
          'pinata_secret_api_key': `f0a2d096004e4f0483a64d06236ddc252b8d8acf612cde6465bc78f013a08ab0`
        };

        try {
          const res = await axios.post(url, info, { headers });
          const meta = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
          console.log(meta);
          mintThenList(meta);
        } catch (error) {
          console.error(error);
        }

      }
      pinJSONToPinata(info)


    } catch (error) {
      console.log(error);
    }

    //   //     async function pinJSONToPinata(info) {
    //   //         const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    //   //         const headers = {
    //   //             'Content-Type': 'application/json',
    //   //             'pinata_api_key': `0a13ef76fb9e01561e05`,
    //   //             'pinata_secret_api_key': `f0a2d096004e4f0483a64d06236ddc252b8d8acf612cde6465bc78f013a08ab0`
    //   //         };

    //   //         try {
    //   //             const res = await axios.post(url, info, { headers });
    //   //             const meta = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
    //   //             console.log(meta);
    //   //             mintThenList(meta);
    //   //         } catch (error) {
    //   //             console.error(error);
    //   //         }

    //   //     }

    //   //  pinJSONToPinata(info)

    // const metadata = JSON.stringify({
    //   name: forminfo.title,
    //   description: forminfo.description
    // });
    // jsonformData.append('pinataMetadata', metadata);

    // const options = JSON.stringify({
    //   cidVersion: 0,
    // })
    // jsonformData.append('pinataOptions', options);

  };


  const mintThenList = async (uri) => {
    // if (marketplace === null) {
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
      // setMarketplace(marketplacecontract);
    // }
    // const commission = Number(await marketplacecontract.commission.call());
    // console.log(commission);
    
    
    // const functionName = "addFile";
    // const functionParams = [uri];
    const listingPrice = ethers.utils.parseEther(forminfo.price.toString())
    // console.log("before parse: "+commission/100 * forminfo.price);
    
    // const listingCommission = ethers.utils.parseEther(((commission/100 * forminfo.price)).toString())
    toast.info("Confirm to Mint the NFT", {
      position: "top-center"
    })
    try {
      console.log("inside try");
      console.log(Number(listingPrice));
      // console.log(Number(listingCommission));
      const tx1 = (await marketplace.addFile(uri, listingPrice))
      // const tx1 = (await marketplace.addFile(uri, listingPrice, {
      //   value: listingCommission
      // }))
      // const tx1=  await(await marketplace.listBuilding(forminfo.apartments, ethers.utils.parseEther(forminfo.price), uri))

      toast.info("Wait till transaction Confirms....", {
        position: "top-center"
      })

      await tx1.wait()
      toast.success("NFT added to marketplace successfully", { position: "top-center" })
    } catch (error) {
      toast.error("Error adding NFT to Marketplace")
      console.log(error);
    }

    // marketplacecontract.addFile(uri, listingPrice)
    //   .send({ from: account, value: (commission * listingPrice)/100 })
    //   .then(toast.success("NFT added to marketplace successfully", { position: "top-center" }))
    //   .catch(console.log);
    // const tx1 = await marketplace.methods.addFile(uri).send({ from: account });
    // console.log('Transaction Hash:', tx1.transactionHash);

    // toast.info("Wait till transaction Confirms....", {
    //   position: "top-center"
    // })

    // await tx1.wait()

  }



  return (
    <div className='h-screen pt-24'>
      <div className="container-fluid mt-5 text-left">
        <div className="content mx-auto">

          <form class="max-w-sm mx-auto">

            <div className='max-w-lg mx-auto'>
              {/* <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="thumbnail">Upload Thumbnail</label> */}
              <label class="block mb-2 text-sm font-medium text-white" for="thumbnail">Upload Thumbnail</label>
              <input onChange={thumbnailChangeHandler} name="thumbnail" class="block w-full mb-4 h-8 text-m  text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" type="file" accept="image/*" />
            </div>
            <div className='max-w-lg mx-auto'>
              <label class="block mb-2 text-sm font-medium text-white" for="nftfile">Upload NFT File</label>
              <input onChange={changeHandler} name="nftfile" class="block w-full mb-4 h-8 text-m  text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" type="file" accept="video/*" />
            </div>


            <div class="mb-4">
              <label for="title" class="block mb-2 text-sm font-medium text-white">NFT Name</label>
              <input onChange={handleChange} type="text" id="title" name='title' class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder="Enter NFT name" required />
            </div>

            {/* <div class="mb-4">
              <label for="owner" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NFT Owner address</label>
              <input onChange={handleChange} type="text" id="owner" name='owner' class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder="Enter NFT owner address" required />
            </div> */}

            <div class="mb-4">
              <label for="price" class="block mb-2 text-sm font-medium text-white">NFT Price</label>
              <input onChange={handleChange} min={1} type="number" id="price" name='price' class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder="Enter Price" />
            </div>

            <label for="description" class="block mb-2 text-sm font-medium text-white">Description</label>
            <textarea onChange={handleChange} name="description" id="description" rows="4" class="block p-2.5 w-full text-sm  mb-4 text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Leave a comment..."></textarea>
            {/* <div class="mb-4">
    <label for="price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price</label>
    <input onChange={handleChange}  type="number" name='price' id="price" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder='0.001' required />
  </div> */}
            <div className='text-center'>


              <button onClick={handleEvent} className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" >
                Mint NFT
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Create