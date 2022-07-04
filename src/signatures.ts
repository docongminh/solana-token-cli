import { Connection, PublicKey, ConfirmedSignatureInfo } from "@solana/web3.js";
import { sleep } from "./utils";
import { TIMEOUT_DEFAULT, TIMES_DEFAULT_RETRY } from "./constants";

export async function getSignaturesForAddress(
  connection: Connection,
  mintAddress: string,
  options?: any,
  timeout = TIMEOUT_DEFAULT,
  retry = TIMES_DEFAULT_RETRY
): Promise<string[]> {
  let signatures: ConfirmedSignatureInfo[];
  let counter = 0;
  while (counter < retry) {
    signatures = await connection.getSignaturesForAddress(
      new PublicKey(mintAddress),
      options
    );
    if (signatures.length !== 0) {
      break;
    }
    console.log(`Retry pull signature...`);
    counter += 1;
    await sleep(timeout);
  }
  return signatures.map((item) => item.signature);
}

export async function getSignatures(
  connection: Connection,
  mintAddress: string
): Promise<Array<string> | null> {
  // valid address
  try {
    new PublicKey(mintAddress);
  } catch (error) {
    console.log("Invalid address");
    return null;
  }

  const allSignatures: string[] = [];
  let signatures = await getSignaturesForAddress(connection, mintAddress);
  allSignatures.push(...signatures);
  do {
    const options = {
      before: signatures[signatures.length - 1],
    };
    signatures = await getSignaturesForAddress(
      connection,
      mintAddress,
      options
    );
    allSignatures.push(...signatures);
  } while (signatures.length > 0);

  return allSignatures;
}
