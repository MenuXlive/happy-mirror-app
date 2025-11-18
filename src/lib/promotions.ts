export type Promotion = {
  key: string;
  title: string;
  description: string;
  category: "beer" | "food" | "drinks" | "alcohol" | "general";
};

export const PRESET_PROMOTIONS: Promotion[] = [
  {
    key: "buy2_beer_get1_free",
    title: "Buy 2 Beer, Get 1 Free",
    description: "Order any two beers and get the third beer free of equal or lesser value.",
    category: "beer",
  },
  {
    key: "happy_hour_beer_5to7",
    title: "Happy Hour Beer (5–7 PM)",
    description: "Flat 20% off on all beers during happy hours.",
    category: "beer",
  },
  {
    key: "buy3_large_pizza_pay2",
    title: "Buy 3 Large Pizza, Pay for 2",
    description: "Get one large pizza free when you order three.",
    category: "food",
  },
  {
    key: "combo_whiskey_starter",
    title: "Whiskey + Starter Combo",
    description: "Flat ₹200 off when ordering any whiskey with a starter.",
    category: "alcohol",
  },
  {
    key: "welcome_drink_weekend",
    title: "Weekend Welcome Drink",
    description: "One complimentary mocktail for every dine-in group on weekends.",
    category: "general",
  },
];

export function getPresetByKey(key: string): Promotion | undefined {
  return PRESET_PROMOTIONS.find((p) => p.key === key);
}