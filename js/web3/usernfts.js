function getNFTsOfUser(){

    // DELETE ALREADY SHOWING NFTs
    const myNode = document.getElementById("placetoshownfts");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }

    var contract = new web3.eth.Contract(abi, contractAddress)
    contract.methods.balanceOf(connectedAddress).call((err, result) => {
        if(!err) {
            var numerOfTokensUserHas = result;
            var arrayOfTokensUserHas = []
            for (let i = 0; i < result; i++) {
				console.log(i);
                contract.methods.tokenOfOwnerByIndex(connectedAddress, i).call((err, result) => {
					console.log("tokenofownerByIndex" + result);
                    arrayOfTokensUserHas.push(result);
                    
					var a = Math.floor(result / 10000);
					console.log(jsonBaseAddress +"/" + a + "/" + result + ".json")

                    getJSONFILE(jsonBaseAddress  + a + "/" + result + ".json",
                        function(err, data) {
                        if (err !== null) {
                            console.log("Something Went Wrong");
                        } else {
							console.log("data is " + data);
							var obj = JSON.parse(data);
							console.log("obj is "+obj);

                            var theURL = obj["image"];
							
                            var img = document.createElement('img');
                            var tokenNumber = document.createElement('h2');
                            var lineBreak = document.createElement('br');
                            img.src = theURL;
                            img.class = "nftimages"
                            // img.style="width: 100%;max-width: 200px;height: auto;display: block;margin-left: auto;margin-right: auto;"
                            tokenNumber.style="font-size: max(2vw, 30px);text-align: center;"
                            tokenNumber.innerHTML = obj["name"];
                            document.getElementById('placetoshownfts').appendChild(tokenNumber);
                            document.getElementById('placetoshownfts').appendChild(img);
                            document.getElementById('placetoshownfts').appendChild(lineBreak);
							console.log(obj["name"]);
							console.log(obj["image"]);
                        }
                    });
                })
            }
        }
    })
}
