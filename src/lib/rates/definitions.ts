export const customerRateDefinitions = [
  {
    key: "gold-999",
    label: "Gold 999",
    aliases: ["gold-999", "gold999"],
  },
  {
    key: "silver-bank",
    label: "Silver Bank",
    aliases: ["silver-bank", "bank-silver"],
  },
  {
    key: "agra-mohar",
    label: "Agra Mohar",
    aliases: ["agra-mohar", "mohar"],
  },
  {
    key: "silver-coin-10gm",
    label: "Silver Coin 10gm",
    aliases: ["silver-coin-10gm", "silver-coin-10-gm", "coin-10gm"],
  },
] as const;

export const marketRateDefinitions = [
  {
    key: "silver-mcx",
    label: "Silver MCX",
    aliases: ["silver-mcx", "mcx-silver"],
  },
  {
    key: "gold-mcx",
    label: "Gold MCX",
    aliases: ["gold-mcx", "mcx-gold"],
  },
  {
    key: "gold-usd",
    label: "Gold ($)",
    aliases: ["gold-usd", "gold-dollar", "gold-$"],
  },
  {
    key: "silver-usd",
    label: "Silver ($)",
    aliases: ["silver-usd", "silver-dollar", "silver-$"],
  },
  {
    key: "inr",
    label: "INR",
    aliases: ["inr", "usd-inr", "rupee"],
  },
] as const;
