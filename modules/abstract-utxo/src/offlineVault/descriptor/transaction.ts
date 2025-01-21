import * as utxolib from '@bitgo/utxo-lib';
import * as t from 'io-ts';

import { NamedDescriptor } from '../../descriptor';
import { OfflineVaultUnsigned, toKeyTriple } from '../OfflineVaultUnsigned';
import {
  getValidatorOneOfTemplates,
  getValidatorSignedByUserKey,
  getValidatorSome,
  toDescriptorMapValidate,
} from '../../descriptor/validatePolicy';
import { DescriptorMap } from '../../core/descriptor';
import { signPsbt } from '../../transaction/descriptor';

export const DescriptorTransaction = t.intersection(
  [OfflineVaultUnsigned, t.type({ descriptors: t.array(NamedDescriptor) })],
  'DescriptorTransaction'
);

export type DescriptorTransaction = t.TypeOf<typeof DescriptorTransaction>;

export function getDescriptorsFromDescriptorTransaction(tx: DescriptorTransaction): DescriptorMap {
  const { descriptors, xpubsWithDerivationPath } = tx;
  const pubkeys = toKeyTriple(xpubsWithDerivationPath);
  const policy = getValidatorSome([
    // allow all 2-of-3-ish descriptors where the keys match the wallet keys
    getValidatorOneOfTemplates(['Wsh2Of3', 'Wsh2Of3CltvDrop', 'ShWsh2Of3CltvDrop']),
    // allow all descriptors signed by the user key
    getValidatorSignedByUserKey(),
  ]);
  return toDescriptorMapValidate(descriptors, pubkeys, policy);
}

export function getHalfSignedPsbt(
  tx: DescriptorTransaction,
  prv: utxolib.BIP32Interface,
  network: utxolib.Network
): utxolib.Psbt {
  const psbt = utxolib.bitgo.createPsbtDecode(tx.coinSpecific.txHex, network);
  const descriptorMap = getDescriptorsFromDescriptorTransaction(tx);
  signPsbt(psbt, descriptorMap, prv, { onUnknownInput: 'throw' });
  return psbt;
}
