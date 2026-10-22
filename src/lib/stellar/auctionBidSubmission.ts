import type { AuctionBid } from '@/lib/auctionEncryption';

export class TransactionSubmissionError extends Error {
  constructor(
    message: string,
    readonly outcome: 'rejected' | 'unknown',
    readonly transactionHash?: string,
  ) {
    super(message);
    this.name = 'TransactionSubmissionError';
  }
}

export type BidSubmissionStatus = NonNullable<AuctionBid['submissionStatus']>;

interface SubmitBidOptions {
  saveBid: (bid: AuctionBid) => Promise<void>;
  updateBidSubmission: (
    name: string,
    status: BidSubmissionStatus,
    transactionHash?: string,
  ) => Promise<void>;
  buildTransaction: () => Promise<string>;
  signTransaction: (xdr: string) => Promise<string>;
  submitTransaction: (signedXdr: string) => Promise<string>;
}

export type BidSubmissionResult =
  | { status: 'committed'; transactionHash: string }
  | { status: 'failed' | 'unknown'; error: unknown; transactionHash?: string };

export async function submitBidWithRecovery(
  bid: AuctionBid,
  options: SubmitBidOptions,
): Promise<BidSubmissionResult> {
  const stagedBid: AuctionBid = { ...bid, submissionStatus: 'pending' };
  delete stagedBid.transactionHash;
  await options.saveBid(stagedBid);

  let signedXdr: string;
  try {
    signedXdr = await options.signTransaction(await options.buildTransaction());
  } catch (error) {
    await options.updateBidSubmission(bid.name, 'failed');
    return { status: 'failed', error };
  }

  let transactionHash: string;
  try {
    transactionHash = await options.submitTransaction(signedXdr);
  } catch (error) {
    const status =
      error instanceof TransactionSubmissionError && error.outcome === 'rejected'
        ? 'failed'
        : 'unknown';
    const transactionHash =
      error instanceof TransactionSubmissionError ? error.transactionHash : undefined;
    await options.updateBidSubmission(bid.name, status, transactionHash);
    return { status, error, ...(transactionHash ? { transactionHash } : {}) };
  }

  await options.updateBidSubmission(bid.name, 'committed', transactionHash);
  return { status: 'committed', transactionHash };
}
