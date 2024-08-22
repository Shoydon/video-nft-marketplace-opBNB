//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VideoNft {
    struct VideoFile {
        address owner;
        string ipfsHash;
        uint256 price;
    }

    uint256 public commission;
    address public platformOwner;
    VideoFile[] videoFiles;
    uint256 public fileCount;

    constructor() {
        platformOwner = msg.sender;
        commission = 10;
        fileCount = 0;
    }

    function addFile(string memory _ipfsHash, uint256 _price) public payable {
        require(msg.value >= (_price * commission) / 100);
        bool success = payable(platformOwner).send(msg.value);
        require(success);
        videoFiles.push(VideoFile(msg.sender, _ipfsHash, _price));
    }

    function viewFiles() public view returns (VideoFile[] memory) {
        return videoFiles;
    }

    function viewCommission() public view returns (uint256) {
        return commission;
    }

    function videosCount() public view returns (uint256) {
        return fileCount;
    }
}
