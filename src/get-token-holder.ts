import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export type ErrorMessage = {
  account: any;
  message: string;
};

export type TokenOwner = {
  owner: string;
  amount: string;
};
/**
 *
 * @param connection Web3 RPC connection
 * @param mintAddress nft mint address
 * @returns current owner of NFT
 */
export async function getNFTOwner(
  connection: Connection,
  mintAddress: string
): Promise<string | null> {
  const largestAccount = await connection.getTokenLargestAccounts(
    new PublicKey(mintAddress)
  );
  if (largestAccount.value.length === 0) {
    console.warn(`This NFT ${mintAddress} maybe burned`);
    return null;
  }
  const largestAccountInfo = await connection.getParsedAccountInfo(
    largestAccount.value[0].address
  );
  // @ts-ignore
  return largestAccountInfo.value.data.parsed.info.owner.toString();
}

/**
 *
 * @param connection web3 RPC connection
 * @param mintAddress Token mint address (semi-token, fungible-token)
 * @returns Array of holder and amount corresponding
 */
export async function getTokenHolders(
  connection: Connection,
  mintAddress: string
): Promise<Array<{ error: boolean; data: TokenOwner | ErrorMessage }>> {
  const accounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      {
        dataSize: 165,
      },
      {
        memcmp: {
          offset: 0,
          bytes: mintAddress,
        },
      },
    ],
  });
  const owners: Array<{ error: boolean; data: TokenOwner | ErrorMessage }> = [];
  for (const account of accounts) {
    try {
      // @ts-ignore
      const info = account.account.data?.parsed?.info;
      // @ts-ignore
      const amount = info.tokenAmount.amount;
      if (amount > 0) {
        owners.push({
          error: false,
          data: {
            owner: info.owner,
            amount: amount,
          },
        });
      }
    } catch (error) {
      owners.push({
        error: true,
        data: {
          account: account,
          message: JSON.stringify(error),
        },
      });
    }
  }
  return owners;
}
