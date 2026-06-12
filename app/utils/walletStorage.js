const WALLET_STORAGE_KEY = "welloUserWallets";

export const DEFAULT_WALLET_SETTINGS = {
  active: true,
  earnType: "percentage",
  earnValue: 5,
  coinValue: 1,
  maxRedeemPercent: 50,
  minOrderToEarn: 0,
  minOrderToRedeem: 0,
};

const readAllWallets = () => {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(WALLET_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeAllWallets = (wallets) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallets));
};

export const getLocalWalletBalance = (userId) => {
  if (!userId) return 0;
  const wallets = readAllWallets();
  return Number(wallets[userId]?.balance || 0);
};

export const calculateEarnCoins = (settings, orderSubtotal) => {
  const config = { ...DEFAULT_WALLET_SETTINGS, ...settings };
  if (!config.active || orderSubtotal < Number(config.minOrderToEarn || 0)) {
    return 0;
  }

  if (config.earnType === "flat") {
    return Math.floor(Number(config.earnValue || 0));
  }

  return Math.floor((orderSubtotal * Number(config.earnValue || 0)) / 100);
};

export const processLocalWalletOrder = ({
  userId,
  orderId,
  orderSubtotal,
  walletCoinsUsed = 0,
  settings = DEFAULT_WALLET_SETTINGS,
}) => {
  if (!userId) {
    return { earnedCoins: 0, walletBalance: 0 };
  }

  const wallets = readAllWallets();
  const current = wallets[userId] || { balance: 0, transactions: [] };
  let balance = Number(current.balance || 0);
  const transactions = Array.isArray(current.transactions) ? [...current.transactions] : [];
  const coinsUsed = Math.max(0, Math.floor(Number(walletCoinsUsed || 0)));

  if (coinsUsed > 0) {
    balance = Math.max(0, balance - coinsUsed);
    transactions.unshift({
      type: "debit",
      coins: coinsUsed,
      orderId,
      description: "Coins used on order",
      createdAt: new Date().toISOString(),
    });
  }

  const earnedCoins = calculateEarnCoins(settings, orderSubtotal);
  if (earnedCoins > 0) {
    balance += earnedCoins;
    transactions.unshift({
      type: "credit",
      coins: earnedCoins,
      orderId,
      description: "Coins earned on order",
      createdAt: new Date().toISOString(),
    });
  }

  wallets[userId] = {
    balance,
    transactions: transactions.slice(0, 50),
  };
  writeAllWallets(wallets);
  window.dispatchEvent(new Event("wallet-balance-updated"));

  return { earnedCoins, walletBalance: balance };
};
