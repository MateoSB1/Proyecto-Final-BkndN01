import express from 'express'
import { createServer } from "http"
import { engine } from "express-handlebars"
import { Server } from "socket.io"

import { CartMongoManager as CartManager } from "./dao/CartMongoManager.js"
import { ProductsMongoManager as ProductsManager } from "./dao/ProductsMongoManager.js"

import productsRouter from "./routes/productsRouter.js"
import cartsRouter from "./routes/cartsRouter.js"
import viewsRouter from "./routes/viewsRouter.js"

import connectDB from './connect.js'

connectDB(
    "mongodb+srv://mateobrancato26:yseG2y8N1AwORQt0@cluster0.iyyd1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    "MateoSB1BkndN01"
)

const app = express()
const PORT = 8080

const httpServer = createServer(app)

const io = new Server(httpServer)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("./src/public"))

app.engine("handlebars", engine())
app.set("view engine", "handlebars")
app.set("views", "./src/views")

app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/", viewsRouter)

app.set("socketio", io)

httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

io.on("connection", async (socket) => {
    console.log('Cliente conectado')

    const limit = 10

    const products = await ProductsManager.getProducts({ limit, page: 1 })
    socket.emit('products', products.docs, products.totalPages, 1)

    socket.on('requestProductsPage', async (page) => {
        const products = await ProductsManager.getProducts({ limit, page })
        socket.emit('paginatedProducts', products.docs, products.totalPages, page)
    })

    socket.on('addProduct', async (productData) => {
        await ProductsManager.addProduct(productData)
        const updatedProducts = await ProductsManager.getProducts({ limit, page: 1 })
        io.emit('products', updatedProducts.docs, updatedProducts.totalPages, 1)
    })

    socket.on("deleteProduct", async (productId) => {
        if (!productId) {
            return;
        }
    
        try {
            await ProductsManager.deleteProduct(productId);
            const limit = 10;
            const updatedProducts = await ProductsManager.getProducts({ limit, page: 1 });
    
            io.emit("products", updatedProducts.docs, updatedProducts.totalPages, 1);
        } catch (error) {
            console.error(`Error al eliminar producto con ID: ${productId}`, error);
        }
    });    

    const carts = await CartManager.getAllCarts();
    socket.emit("carts", carts);

    socket.on("addProductToCart", async ({ cartId, productId, quantity }) => {
        try {
            const updatedCart = await CartManager.addProductCart(cartId, productId, quantity);
            io.emit("cartUpdated", updatedCart);
        } catch (error) {
            console.error("Error al agregar producto al carrito:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado')
    })
})
