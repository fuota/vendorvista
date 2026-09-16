export const CATEGORIES = [
    {name: 'Electronics', slug: 'electronics', icon: 'fa-solid fa-laptop'},
    {name: 'Clothing', slug: 'clothing', icon: 'fa-solid fa-shirt'},
    {name: 'Furniture', slug: 'furniture', icon: 'fa-solid fa-chair'},
    {name: 'Books', slug: 'books', icon: 'fa-solid fa-book'},
    {name: 'Toys', slug: 'toys', icon: 'fa-solid fa-gamepad'},
    {name: 'Sporting Goods', slug: 'sporting-goods', icon: 'fa-solid fa-dumbbell'},
    {name: 'Home & Garden', slug: 'home-garden', icon: 'fa-solid fa-seedling'},
    {name: 'Vehicles', slug: 'vehicles', icon: 'fa-solid fa-car'},
    {name: 'Other', slug: 'other', icon: 'fa-solid fa-box'},
]

export const CATEGORY_OPTIONS = CATEGORIES.map((c) => c.name)
