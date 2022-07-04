import { Connection, clusterApiUrl } from "@solana/web3.js";
import { program } from "commander";
import "dotenv/config";
import fs from "fs";
import { getParsedTransaction, parsedMint } from "./parsedTransaction";
import { getSignaturesForAddress } from "./signatures";
import { getNFTOwner, getTokenHolders } from "./get-token-holder";

program.version("1.0.0");
function setup(rpc?: string): Connection {
  let conn: Connection;
  if (rpc) {
    conn = new Connection(rpc);
  } else {
    console.warn(`Use mainne-beta defaul rpc will be limit request`);
    conn = new Connection(clusterApiUrl("mainnet-beta"));
  }

  return conn;
}

program
  .command("get-minter")
  .requiredOption(
    "-f, --file <string>",
    "Path to json file contain all mint addresses"
  )
  .option("-r, --rpc-url <string>", "Optional: Custom RPC url")
  .action(async (dir, cmd) => {
    const { file, rpcUrl } = cmd.opts();
    const mintAddress = require(file);
    const conn = setup(rpcUrl);
    if (mintAddress.length === 0) {
      throw new Error(`Must be provide path to mintAddress json file \
    command`);
    }
    // storage logs
    const results = [];
    const errors = [];

    console.log(`Starting get minter with info: `, {
      total_mints: mintAddress.length,
      rpc_using: rpcUrl,
    });

    for (let index = 0; index < mintAddress.length; index++) {
      try {
        const retry = 5;
        let data: any = null;
        let oldestSignature: string;
        let count = 0;
        while (data === null && count < retry) {
          const allSignature = await getSignaturesForAddress(
            conn,
            mintAddress[index]
          );
          oldestSignature = allSignature[allSignature.length - 1];
          console.log("parsing: ", oldestSignature);
          const parsedTransaction = await getParsedTransaction(
            conn,
            oldestSignature
          );
          data = parsedMint(parsedTransaction.meta);
          count += 1;
          // await sleep(3000);
        }
        results.push({
          mintAddress: mintAddress[index],
          signature: oldestSignature,
          data: data,
        });
        console.log({
          mintAddress: mintAddress[index],
          signature: oldestSignature,
          data: data,
        });
      } catch (error) {
        console.log(error);
        errors.push({ error: JSON.stringify(error), mintAddress: mintAddress });
      }
      console.log(`Processed ${index + 1}/${mintAddress.length}`);
      console.log(`Success: ${results.length}`);
      console.log(`Errors: ${errors.length}`);
      console.log("------------");
    }
    fs.writeFileSync(`minters.json`, JSON.stringify(results));
    if (errors.length > 0) {
      fs.writeFileSync(`errors.json`, JSON.stringify(errors));
    }
  });

program
  .command("get-nft-owner")
  .requiredOption(
    "-f, --file <string>",
    "Path to json file contain all mint addresses"
  )
  .option("-r, --rpc-url <string>", "Optional: Custom RPC url")
  .action(async (dir, cmd) => {
    const { file, rpcUrl } = cmd.opts();
    const mintAddress = require(file);
    const conn = setup(rpcUrl);
    if (mintAddress.length === 0) {
      throw new Error(`Must be provide path to mintAddress json file \
    command`);
    }
    // storage logs
    const results: Array<{ mintAddress: string; owner: string | null }> = [];
    const errors = [];

    console.log(`Starting get nft holder with info: `, {
      total_mints: mintAddress.length,
      rpc_using: rpcUrl,
    });

    for (let index = 0; index < mintAddress.length; index++) {
      try {
        const owner = await getNFTOwner(conn, mintAddress[index]);
        results.push({
          mintAddress: mintAddress[index],
          owner: owner,
        });
        console.log({
          mintAddress: mintAddress[index],
          owner: owner,
        });
      } catch (error) {
        console.log(error);
        errors.push({ error: JSON.stringify(error), mintAddress: mintAddress });
      }
      console.log(`Processed ${index + 1}/${mintAddress.length}`);
      console.log(`Success: ${results.length}`);
      console.log(`Errors: ${errors.length}`);
      console.log("------------");
    }
    fs.writeFileSync(`nft-owners.json`, JSON.stringify(results));
    if (errors.length > 0) {
      fs.writeFileSync(`errors.json`, JSON.stringify(errors));
    }
  });

program
  .command("get-token-holder")
  .option("-m, --mint <string>", "Mint address get holder")
  .option("-r, --rpc-url <string>", "Optional: Custom RPC url")
  .option("-f, --file <string>", "Optional: Get with list mint tokens")
  .action(async (dir, cmd) => {
    const { mint, rpcUrl, file } = cmd.opts();
    // rpc connection
    const conn = setup(rpcUrl);
    const mintAddress = [];
    if (mint) {
      mintAddress.push(mint);
    } else if (file) {
      const mints = require(file);
      mintAddress.push(...mints);
    } else {
      throw new Error(
        `You must provide a mint address or file Json contain list mint addressess`
      );
    }
    if (mintAddress.length === 0) {
      throw new Error(`Must be provide path to mintAddress json file \
    command`);
    }
    console.log(`Starting get nft holder with info: `, {
      total_mints: mintAddress.length,
      rpc_using: rpcUrl,
    });
    if (mintAddress.length === 1) {
      const holders = await getTokenHolders(conn, mintAddress[0]);
      console.log(`Found ${holders.length} holders for ${mintAddress[0]}`);
      fs.writeFileSync(`${mintAddress[0]}.json`, JSON.stringify(holders));
    } else {
      const errors = [];
      for (let index = 0; index < mintAddress.length; index++) {
        try {
          const holders = await getTokenHolders(conn, mintAddress[index]);
          fs.writeFileSync(
            `${mintAddress[index]}.json`,
            JSON.stringify(holders)
          );
        } catch (error) {
          console.log(error);
          errors.push({
            error: JSON.stringify(error),
            mintAddress: mintAddress,
          });
        }
        console.log(`Processed ${index + 1}/${mintAddress.length}`);
        console.log(`Errors: ${errors.length}`);
        console.log("------------");
      }
      if (errors.length > 0) {
        fs.writeFileSync(`errors.json`, JSON.stringify(errors));
      }
    }
  });

program.parse(process.argv);
