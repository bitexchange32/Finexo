import { AbstractUtxoCoin } from '../../../../../../src/v2/coins';
import { Wallet } from '@bitgo/sdk-core';
import { defaultBitGo } from './utxoCoins';

export function getUtxoWallet(coin: AbstractUtxoCoin, walletData = {}): Wallet {
  return new Wallet(defaultBitGo, coin, walletData);
}
