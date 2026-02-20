'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';

// Program ID from the deployed Leo program
const PROGRAM_ID = 'predictionprivacyhackviii.aleo';

// Native Aleo credits program
const CREDITS_PROGRAM_ID = 'credits.aleo';

// Network the wallet connects to
const ALEO_NETWORK = 'testnetbeta';

// Default pool ID (will be made dynamic later)
const DEFAULT_POOL_ID = '1field';

interface PredictionParams {
  poolId?: string;
  option: 1 | 2; // 1 for option A, 2 for option B
  amount: number; // Amount in ALEO (will be converted to microcredits)
}

interface PredictionResult {
  transactionId: string | undefined;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

function generateRandomNumber(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

/**
 * Try to extract microcredits balance from a record regardless of format.
 */
function extractMicrocredits(record: any): bigint | null {
  try {
    const obj = typeof record === 'string' ? JSON.parse(record) : record;
    const raw =
      obj?.microcredits ??
      obj?.data?.microcredits ??
      obj?.plaintext?.microcredits;

    if (raw == null) return null;

    const str = String(raw)
      .replace('u64.private', '')
      .replace('u64.public', '')
      .replace('u64', '')
      .trim();

    return BigInt(str);
  } catch {
    return null;
  }
}

export function usePrediction() {
  const {
    publicKey,
    requestTransaction,
    requestExecution,
    requestRecords,
    requestRecordPlaintexts,
  } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const makePrediction = useCallback(
    async ({
      poolId = DEFAULT_POOL_ID,
      option,
      amount,
    }: PredictionParams): Promise<PredictionResult> => {
      if (!publicKey) {
        return {
          transactionId: undefined,
          status: 'error',
          error: 'Wallet not connected',
        };
      }

      if (!requestExecution && !requestTransaction) {
        return {
          transactionId: undefined,
          status: 'error',
          error: 'Wallet does not support transactions',
        };
      }

      setIsLoading(true);
      setError(null);

      try {
        const randomNumber = generateRandomNumber();
        const formattedPoolId = poolId.endsWith('field') ? poolId : `${poolId}field`;
        const amountInMicrocredits = amount * 1_000_000;

        // --- Step 1: Try to fetch credits records ---
        console.log('=== PREDICTION DEBUG ===');
        console.log('Public key:', publicKey);
        console.log('Amount (ALEO):', amount);
        console.log('Amount (microcredits):', amountInMicrocredits);
        console.log('requestRecords available:', !!requestRecords);
        console.log('requestRecordPlaintexts available:', !!requestRecordPlaintexts);
        console.log('requestExecution available:', !!requestExecution);
        console.log('requestTransaction available:', !!requestTransaction);

        let creditsRecord: string | undefined;

        const programsToTry = [CREDITS_PROGRAM_ID, PROGRAM_ID];
        const fetchMethods = [
          { name: 'requestRecords', fn: requestRecords },
          { name: 'requestRecordPlaintexts', fn: requestRecordPlaintexts },
        ];

        for (const program of programsToTry) {
          if (creditsRecord) break;

          for (const method of fetchMethods) {
            if (creditsRecord || !method.fn) continue;

            try {
              console.log(`Trying ${method.name}('${program}')...`);
              const records = await method.fn(program);
              console.log(`${method.name}('${program}') returned ${records?.length ?? 0} records`);

              if (records && records.length > 0) {
                console.log('First record raw type:', typeof records[0]);
                console.log('First record raw value:', JSON.stringify(records[0]).slice(0, 500));

                for (const record of records) {
                  const balance = extractMicrocredits(record);
                  console.log('Record balance:', balance?.toString());
                  if (balance !== null && balance >= BigInt(amountInMicrocredits)) {
                    creditsRecord = typeof record === 'string' ? record : JSON.stringify(record);
                    console.log('Found suitable record with balance:', balance.toString());
                    break;
                  }
                }
              }
            } catch (e) {
              console.warn(`${method.name}('${program}') failed:`, e);
            }
          }
        }

        // --- Step 2: Build inputs ---
        const inputs: string[] = [
          formattedPoolId,
          `${option}u64`,
          `${amountInMicrocredits}u64`,
          `${randomNumber}u64`,
        ];

        if (creditsRecord) {
          inputs.push(creditsRecord);
          console.log('Including credits record in inputs');
        } else {
          console.warn('No credits record found — sending without it, wallet may auto-fill');
        }

        // --- Step 3: Build and send transaction ---
        const aleoTransaction = {
          address: publicKey,
          chainId: ALEO_NETWORK,
          transitions: [
            {
              program: PROGRAM_ID,
              functionName: 'predict',
              inputs: inputs,
            },
          ],
          fee: 100_000,
          feePrivate: true,
        };

        console.log('=== TRANSACTION ===');
        console.log('Transaction:', JSON.stringify(aleoTransaction, null, 2));

        // Try requestExecution first (correct for program function calls),
        // fall back to requestTransaction
        let result: string | undefined;
        if (requestExecution) {
          console.log('Using requestExecution...');
          try {
            result = await requestExecution(aleoTransaction);
          } catch (execError) {
            console.warn('requestExecution failed, trying requestTransaction:', execError);
            if (requestTransaction) {
              result = await requestTransaction(aleoTransaction);
            } else {
              throw execError;
            }
          }
        } else if (requestTransaction) {
          console.log('Using requestTransaction...');
          result = await requestTransaction(aleoTransaction);
        }

        setTransactionId(result || null);
        setIsLoading(false);

        return {
          transactionId: result,
          status: 'success',
        };
      } catch (e) {
        console.error('Prediction error:', e);
        const errorMessage = e instanceof Error ? e.message : 'Transaction failed';
        setError(errorMessage);
        setIsLoading(false);

        return {
          transactionId: undefined,
          status: 'error',
          error: errorMessage,
        };
      }
    },
    [publicKey, requestTransaction, requestExecution, requestRecords, requestRecordPlaintexts]
  );

  return {
    makePrediction,
    isLoading,
    error,
    transactionId,
    isConnected: !!publicKey,
    publicKey,
  };
}
