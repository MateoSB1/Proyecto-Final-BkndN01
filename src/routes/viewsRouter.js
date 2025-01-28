import { Router } from "express"
import { ProductsMongoManager as ProductManager } from "../dao/ProductsMongoManager.js"
import { CartMongoManager as CartManager } from "../dao/CartMongoManager.js"
import { procesadorDeErrores500 } from "../utils.js"

const router = Router()

router.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query

        const products = await ProductManager.getProducts({
            limit: parseInt(limit),
            page: parseInt(page),
            sort,
            query,
        })

        const arrayProducts = products.docs.map(product => {
            return product._doc
        })

        const multiplePages = products.totalPages > 1

        res.render("home", {
            products: arrayProducts,
            totalPages: products.totalPages,
            prevPage: products.prevPage || 1,
            nextPage: products.nextPage || null,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `/api/products?limit=${limit}&page=${products.prevPage}&sort=${sort}&query=${query}` : null,
            nextLink: products.hasNextPage ? `/api/products?limit=${limit}&page=${products.nextPage}&sort=${sort}&query=${query}` : null,
            multiplePages,
        })
    } catch (error) {
        console.error("Error al obtener productos", error)
        procesadorDeErrores500(res, error)
    }
})

router.get("/products", async (req, res) => {
    const { limit = 10, page = 1 } = req.query;

    try {
        const products = await ProductManager.getProducts({
            limit: parseInt(limit, 10),
            page: parseInt(page, 10),
        });

        const formattedProducts = products.docs.map(product => ({
            title: product.title || "Sin título",
            description: product.description || "Sin descripción",
            price: product.price || 0,
            stock: product.stock || "Sin stock", // Aquí se incluye el stock
            category: product.category || "Sin categoría",
            thumbnails: product.thumbnails && product.thumbnails.length ? product.thumbnails : ["https://via.placeholder.com/150"],
        }));        

        const carts = await CartManager.getAllCarts();
        const lastCart = carts.length ? carts[carts.length - 1] : null;

        res.render("products", {
            products: formattedProducts,
            lastCart: lastCart ? lastCart.toObject() : null,
            multiplePages: products.totalPages > 1,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
        });
    } catch (error) {
        console.error("Error al renderizar la vista de productos:", error);
        res.status(500).send("Error al renderizar la vista.");
    }
});

router.get("/products/:pid", async (req, res) => {
    try {
        const product = await ProductManager.getProductById(req.params.pid)
        if (!product) {
            return res.status(404).render("404", { message: "Producto no encontrado" })
        }
        res.render("productDetail", { product })
    } catch (error) {
        console.error("Error al obtener detalles de productos:", error)
        procesadorDeErrores500(res, error)
    }
})

router.get('/realtimeproducts', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;

    try {
        const products = await ProductManager.getProducts({
            limit: parseInt(limit),
            page: parseInt(page),
            sort,
            query,
        });

        // Asegúrate de enviar datos completos
        const formattedProducts = products.docs.map(product => ({
            title: product.title || 'Sin título',
            description: product.description || 'Sin descripción',
            price: product.price || 0,
            code: product.code || 'N/A',
            status: product.status || false,
            stock: product.stock || 0,
            category: product.category || 'Sin categoría',
            thumbnails: product.thumbnails || [],
        }));

        res.render('realTimeProducts', {
            products: formattedProducts,
            totalPages: products.totalPages,
            prevPage: products.prevPage || 1,
            nextPage: products.nextPage || null,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            multiplePages: products.totalPages > 1,
        });
    } catch (error) {
        console.error('Error al obtener productos', error);
        procesadorDeErrores500(res, error);
    }
});

router.get("/carts", async (req, res) => {
    try {
        const carts = await CartManager.getAllCarts(); // Obtiene todos los carritos y los productos con populate
        const plainCarts = carts.map(cart => cart.toObject()); // Convierte a objetos planos

        res.render("cartDetail", {
            title: "Lista de Carritos",
            carts: plainCarts,
        });
    } catch (error) {
        console.error("Error al obtener la vista de carritos:", error);
        procesadorDeErrores500(res, error);
    }
});

router.get("/carts/:cid", async (req, res) => {
    try {
        const cart = await CartManager.getCartById(req.params.cid); // Obtiene el carrito con populate
        if (!cart) {
            return res.status(404).render("404", { message: "Carrito no encontrado" });
        }

        const plainCart = cart.toObject(); // Convierte el carrito a un objeto plano

        res.render("cartDetail", {
            title: `Detalles del Carrito: ${req.params.cid}`,
            cart: plainCart,
        });
    } catch (error) {
        console.error("Error al obtener detalles del carrito:", error);
        res.status(500).send("Error al obtener detalles del carrito");
    }
});

export default router
