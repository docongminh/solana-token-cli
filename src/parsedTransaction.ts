import {
  Connection,
  ParsedTransactionWithMeta,
  ParsedTransaction,
  ParsedTransactionMeta,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { TIMEOUT_DEFAULT, TIMES_DEFAULT_RETRY } from "./constants";
import { sleep } from "./utils";

export async function getParsedTransaction(
  connection: Connection,
  signature: string,
  timeout = TIMEOUT_DEFAULT,
  retry = TIMES_DEFAULT_RETRY
): Promise<{
  slot: number;
  blockTime?: number;
  transaction: ParsedTransaction;
  meta: ParsedTransactionMeta;
} | null> {
  let confirmedTransaction: ParsedTransactionWithMeta | null = null;
  let counter = 0;
  while (counter < retry + 1) {
    const transaction = await connection.getParsedTransaction(signature);
    if (transaction) {
      confirmedTransaction = transaction;
      break;
    }
    // await sleep(timeout);
    counter += 1;
  }
  if (confirmedTransaction) {
    return {
      slot: confirmedTransaction.slot,
      blockTime: confirmedTransaction.blockTime
        ? confirmedTransaction.blockTime
        : null,
      transaction: confirmedTransaction.transaction,
      meta: confirmedTransaction?.meta,
    };
  } else {
    return null;
  }
}

export function parsedMint(meta: ParsedTransactionMeta): any | null {
  const instructions = meta?.innerInstructions[0]?.instructions;
  if (!instructions) {
    return null;
  }
  let decimals: number;
  let mintAddress: string;
  let mintAuthority: string;
  //

  for (const instruction of instructions) {
    // @ts-ignore
    const program = instruction.program;
    // @ts-ignore
    const info = instruction.parsed?.info;
    // @ts-ignore
    const type = instruction.parsed?.type;
    if (program == "spl-token" && type == "initializeMint") {
      decimals = info.decimals;
      mintAddress = info.mint;
    }
    if (program == "spl-token" && type == "mintTo") {
      mintAuthority = info.mintAuthority;
    }
  }
  const metaInfo = instructions
    .filter((item) => {
      return (
        // @ts-ignore
        item.program == "system" &&
        // @ts-ignore
        item.parsed.type == "transfer" &&
        // @ts-ignore
        item.parsed.info.source === mintAuthority
      );
    })
    .map((item) => {
      return {
        // @ts-ignore
        mintFee: (item.parsed.info.lamports / LAMPORTS_PER_SOL).toString(),
        // @ts-ignore
        treasuryAccount: item.parsed.info.destination,
      };
    });
  if (mintAuthority && mintAddress && decimals === 0) {
    return {
      mintAddress: mintAddress,
      owner: mintAuthority,
      ...metaInfo[0],
    };
  } else {
    return null;
  }
}
