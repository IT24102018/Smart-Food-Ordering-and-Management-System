export type Product = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  description: string;
  price: number;
  rating: number;
  eta: string;
};

export const defaultProducts: Product[] = [
  {
    id: 'f1',
    name: 'Chicken Tikka Pizza',
    category: 'Pizza',
    imageUrl:
      'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=1200&q=80',
    description: 'Thin crust, smoked chicken, onions, mozzarella.',
    price: 1450,
    rating: 4.8,
    eta: '20-28 min',
  },
  {
    id: 'f2',
    name: 'Classic Beef Burger',
    category: 'Burger',
    imageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    description: 'Double patty, cheddar, lettuce, house sauce.',
    price: 950,
    rating: 4.6,
    eta: '15-22 min',
  },
  {
    id: 'f3',
    name: 'Spicy Chicken Rice Bowl',
    category: 'Rice',
    imageUrl:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
    description: 'Steamed rice, chili chicken, crunchy vegetables.',
    price: 780,
    rating: 4.7,
    eta: '16-24 min',
  },
  {
    id: 'f4',
    name: 'Chocolate Lava Cake',
    category: 'Dessert',
    imageUrl:
      'https://images.unsplash.com/photo-1617305855058-336d24456869?auto=format&fit=crop&w=1200&q=80',
    description: 'Warm center, cocoa dust, vanilla drizzle.',
    price: 520,
    rating: 4.9,
    eta: '12-18 min',
  },
  {
    id: 'f5',
    name: 'Mint Lemon Cooler',
    category: 'Drinks',
    imageUrl:
      'https://images.unsplash.com/photo-1605270012917-bf157c5a9541?auto=format&fit=crop&w=1200&q=80',
    description: 'Fresh lemon, mint leaves, light sparkling fizz.',
    price: 280,
    rating: 4.5,
    eta: '10-15 min',
  },
  {
    id: 'f6',
    name: 'Cheese Burst Pizza',
    category: 'Pizza',
    imageUrl:
      'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=1200&q=80',
    description: 'Stuffed crust, extra cheese, oregano mix.',
    price: 1650,
    rating: 4.7,
    eta: '22-30 min',
  },
  {
    id: 'f7',
    name: 'Chicken Shawarma Wrap',
    category: 'Burger',
    imageUrl:
      'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=80',
    description: 'Grilled chicken, garlic sauce, fries on the side.',
    price: 890,
    rating: 4.6,
    eta: '14-20 min',
  },
  {
    id: 'f8',
    name: 'Creamy Alfredo Pasta',
    category: 'Rice',
    imageUrl:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80',
    description: 'Velvety white sauce, herbs, parmesan, mushrooms.',
    price: 1120,
    rating: 4.8,
    eta: '18-26 min',
  },
  {
    id: 'f9',
    name: 'Classic Mango Shake',
    category: 'Drinks',
    imageUrl:
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1200&q=80',
    description: 'Fresh mango blend, chilled milk, smooth and sweet.',
    price: 360,
    rating: 4.5,
    eta: '8-12 min',
  },
  {
    id: 'f10',
    name: 'Hot Fudge Sundae',
    category: 'Dessert',
    imageUrl:
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80',
    description: 'Vanilla scoop, hot fudge, nuts, and whipped cream.',
    price: 490,
    rating: 4.9,
    eta: '10-14 min',
  },
  {
    id: 'f11',
    name: 'Pepperoni Fire Pizza',
    category: 'Pizza',
    imageUrl:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    description: 'Pepperoni slices, mozzarella, chili oil, and herbs.',
    price: 1580,
    rating: 4.7,
    eta: '21-29 min',
  },
  {
    id: 'f12',
    name: 'Veggie Supreme Pizza',
    category: 'Pizza',
    imageUrl:
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=1200&q=80',
    description: 'Bell peppers, olives, onions, mushrooms, and cheese.',
    price: 1380,
    rating: 4.5,
    eta: '19-27 min',
  },
  {
    id: 'f13',
    name: 'BBQ Chicken Burger',
    category: 'Burger',
    imageUrl:
      'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=1200&q=80',
    description: 'Grilled chicken, smoky BBQ sauce, cheddar, and pickles.',
    price: 1020,
    rating: 4.7,
    eta: '16-23 min',
  },
  {
    id: 'f14',
    name: 'Double Cheese Burger',
    category: 'Burger',
    imageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    description: 'Two beef patties, double cheese, onion, and house sauce.',
    price: 1120,
    rating: 4.8,
    eta: '15-21 min',
  },
  {
    id: 'f15',
    name: 'Teriyaki Chicken Rice',
    category: 'Rice',
    imageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    description: 'Steamed rice, glazed chicken, sesame, and vegetables.',
    price: 860,
    rating: 4.7,
    eta: '17-24 min',
  },
  {
    id: 'f16',
    name: 'Chicken Fried Rice',
    category: 'Rice',
    imageUrl:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
    description: 'Wok-tossed rice with chicken, egg, and spring onions.',
    price: 820,
    rating: 4.6,
    eta: '15-22 min',
  },
  {
    id: 'f17',
    name: 'Oreo Cheesecake',
    category: 'Dessert',
    imageUrl:
      'https://images.unsplash.com/photo-1564128442383-9201fcc6c4c2?auto=format&fit=crop&w=1200&q=80',
    description: 'Creamy cheesecake with Oreo crust and cookie crumble.',
    price: 640,
    rating: 4.8,
    eta: '11-16 min',
  },
  {
    id: 'f18',
    name: 'Strawberry Waffle Stack',
    category: 'Dessert',
    imageUrl:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80',
    description: 'Warm waffles, strawberries, cream, and syrup.',
    price: 590,
    rating: 4.7,
    eta: '12-18 min',
  },
  {
    id: 'f19',
    name: 'Iced Caramel Latte',
    category: 'Drinks',
    imageUrl:
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80',
    description: 'Espresso, milk, caramel syrup, and ice.',
    price: 420,
    rating: 4.6,
    eta: '8-12 min',
  },
  {
    id: 'f20',
    name: 'Fresh Lime Soda',
    category: 'Drinks',
    imageUrl:
      'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1200&q=80',
    description: 'Chilled lime, mint, soda, and a bright citrus finish.',
    price: 260,
    rating: 4.5,
    eta: '7-10 min',
  },
];

export const foodItems = defaultProducts;

export const getProductCategories = (products: Product[]) => {
  const uniqueCategories = Array.from(new Set(products.map((product) => product.category)));

  return ['All', ...uniqueCategories];
};
