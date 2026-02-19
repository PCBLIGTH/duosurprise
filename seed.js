const { connectDB } = require('./db');
const Product = require('./models/Product');

const productsCount = [
    {
        name: "Collier Éternité Or 18k",
        category: "luxury",
        price: 24900,
        image: "assets/products/collier_main.png",
        images: [
            "assets/products/collier_main.png",
            "assets/products/collier_detail_1.png",
            "assets/products/collier_box.png"
        ],
        description: "Un somptueux collier en or 18 carats orné d'un diamant taille goutte. Livré dans son écrin de velours premium.",
        tag: "Best-Seller",
        featured: true
    },
    {
        name: "Box Romantique Ultimate",
        category: "romantic",
        price: 15000,
        image: "assets/products/box_main.png",
        images: ["assets/products/box_main.png", "assets/products/box_detail.png"],
        description: "Une boîte mystère remplie de douceurs et de surprises romantiques pour célébrer votre amour.",
        tag: "Coup de Cœur",
        featured: true
    }
];

async function seed() {
    try {
        await connectDB();
        console.log('Connected to MySQL for seeding...');

        // Clear existing products
        await Product.destroy({ where: {}, truncate: false });

        // Add new products
        for (const p of productsCount) {
            await Product.create(p);
        }

        console.log('Database successfully seeded with MySQL!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding MySQL database:', err);
        process.exit(1);
    }
}

seed();
