# solana-token-cli
A minimul tool support get some token metadata on solana

## Features supporting

 - [x] Get NFT minter by mint address
 - [x] Get currently owner of an NFT
 - [x] Get all holder for specify token / semi-token by mint address
 - [ ] Continuously update ...
 
 ## Quick usage
 
 ### Clone & Install
  ``` bash
    git clone https://github.com/docongminh/solana-token-cli
  ```
  
  ``` bash
    cd solana-token-cli && npm install
  ```
  
  ## Get minter
  
  - Docs
    ``` bash
      npx ts-node src/index.ts get-minter --help
    ```

    Console
    ```
      Usage: index get-minter [options]
      Options:
        -f, --file <string>     Path to json file contain all mint addresses
        -r, --rpc-url <string>  Optional: Custom RPC url
        -h, --help              display help for command
    ```
    
     Example run get minter
     ``` bash
        npx ts-node src/index.ts get-minter -r custom_rpc_url -f path/to/json/mint/file
     ```
     
     Data example:
     ```json
      {
        "mintAddress": "4bgb2ZnHHamSzijnSkD616gpB4KprKix8jLHJ4Q3PGaw",
        "signature": "5xbWtJyHm3tt29GtN8TbgwHbSxxCCsJSo8uDHfNhnzAkxBUEQhGfUT2kVPPBjWm3d5wMsYnRHGDNk1TBAqwUH2GC",
        "data": {
          "mintAddress": "4bgb2ZnHHamSzijnSkD616gpB4KprKix8jLHJ4Q3PGaw",
          "owner": "6jpxgx7Dvb41qe7v76GmoGFKnUKAnSuQyGHBFftoLQH3",
          "mintFee": "1.5",
          "treasuryAccount": "AzG1C58ggbGxa6vEWP12791rVggvVp4hVsos57YKmqvT"
        }
      }
     ```

     Note: You should use your custom url to make sure your process do not stop by block-rpc
   
  ## Get NFT owner
  
  - Docs
    ``` bash
      npx ts-node src/index.ts get-nft-owner --help
    ```
    
    Console
    ```
      Usage: index get-nft-owner [options]
      Options:
        -f, --file <string>     Path to json file contain all mint addresses
        -r, --rpc-url <string>  Optional: Custom RPC url
        -h, --help              display help for command
    ```
    
     Example run get nft owner
     ``` bash
        npx ts-node src/index.ts get-nft-owner -r custom_rpc_url -f path/to/json/mint/file
     ```
     
     Data example
     ```json
      {
        "mintAddress": "3mE8yenN6C3taJbSR6vJYmkmMM7b1Nzod5SVPY615s6F",
        "owner": "4wpfDnKne9qiw5dhocauXG7fxEiuoASBu1dKEQsLXg79"
      }
     ```

     Note:
      - `owner` field might be `null` because sometime an NFT burned
      - You should use your custom url to make sure your process do not stop by block-rpc

  ## Get Token/Semi-token holder
  
  - Docs
    ``` bash
      npx ts-node src/index.ts get-token-holder --help
    ```
    
    Console
    ```
      Usage: index get-token-holder [options]
      Options:
        -m, --mint <string>     Mint address get holder
        -r, --rpc-url <string>  Optional: Custom RPC url
        -f, --file <string>     Optional: Get with list mint tokens
        -h, --help              display help for command
    ```
    
     Example run get token/semi holder
     Run with single token (mint address0
     ``` bash
        npx ts-node src/index.ts get-token-holder -r custom_rpc_url -m /mint/address
     ```
     Run with list of tokens (list of mint address in json file)
     ``` bash
        npx ts-node src/index.ts get-token-holder -r custom_rpc_url -f path/to/json/mint/file
     ```
     Data example
     ```json
      {
        "error": false,
        "data": {
          "owner": "9HH56knyrYZ1oxBExLWoFLLcpoQ9v62geHsb2a3fbhjc",
          "amount": "1"
        }
      }
     ```
     Note: You should use your custom url to make sure your process do not stop by block-rpc
  
