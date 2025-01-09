import express from 'express'
import { createServer } from "http"
import { engine } from "express-handlebars"
import { Server } from "socket.io"

import ProductsManager from "./dao/ProductsManager.js"

import productsRouter from "./routes/productsRouter.js"
import cartsRouter from "./routes/cartsRouter.js"
import viewsRouter from "./routes/viewsRouter.js"
const PORT = 8080

const app = express()
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
    console.log("Cliente conectado")

    socket.emit("products", await ProductsManager.getProducts())

    socket.on("addProduct", async (productData) => {
        const { title, description, price, code, status, stock, category, thumbnail } = productData
        await ProductsManager.addProduct(title, description, price, code, status, stock, category, thumbnail)
        io.emit("products", await ProductsManager.getProducts())
    })

    socket.on("deleteProduct", async (productId) => {
        await ProductsManager.deleteProduct(productId)
        io.emit("products", await ProductsManager.getProducts())
    })

    socket.on("disconnect", () => {
        console.log("Cliente desconectado")
    })
})
