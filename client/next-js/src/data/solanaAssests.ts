export const assets = [
  {
    name: "WIF",
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    decimals: 6,
    img: "/tokens/wif.jpeg",
  },
  {
    name: "BONK",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    img: "/tokens/bonk.jpeg",
  },
];

export function getSupportedAssetList() {
  return assets.map(asset => asset.name)
}

export function getSupportedAssetString() {
  return getSupportedAssetList().join(", ");
}

export function getAssetByName(name: string) {
  const lowerCaseName = name.toLowerCase();
  return assets.find((asset) => asset.name.toLowerCase() === lowerCaseName);
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getAssetByAddress(address: string) {
  const asset = assets.find((asset) => asset.mint === address);
  return asset ? asset : { name: shortenAddress(address) };
}
