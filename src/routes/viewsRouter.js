import { Router } from "express"
import { ProductsManager } from "../dao/ProductsManager.js"

const router = Router()
ProductsManager.setProductsPath("./src/data/products.json")

router.get("/", async (req, res) => {
    const products = await ProductsManager.getProducts()
    res.render("home", { products })
})

router.get("/realtimeproducts", async (req, res) => {
    res.render("realTimeProducts")
})

export default router
