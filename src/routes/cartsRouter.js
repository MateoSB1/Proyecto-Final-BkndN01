import { Router } from "express"
import { CartManager } from "../dao/CartManager.js"
import { procesadorDeErrores500 } from "../utils.js"

export const router = Router()

CartManager.setCartsPath("./src/data/carts.json")

// Obtener carrito por id
router.get("/:id", async (req, res) => {

    let { id } = req.params
    id = Number(id)
    if (isNaN(id)) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(400).json({ error: `Complete con un id numérico` })
    }

    try {
        let cart = await CartManager.getCartById(id)
        if (!cart) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ error: `No existe cart con id ${id}` })
        }

        res.setHeader('Content-Type', 'application/json')
        return res.status(200).json({ cart })
    } catch (error) {
        procesadorDeErrores500(res, error)
    }

})

// Crear un carrito nuevo
router.post("/", async (req, res) => {
    try {
        let newCart = await CartManager.addCart()
        return res.status(201).json({ payload: `Carrito creado exitosamente`, newCart })
    } catch (error) {
        procesadorDeErrores500(res, error)
    }
})

// Agregar un producto a un carrito
router.post("/:id/products", async (req, res) => {
    let { id } = req.params
    let { productId, quantity } = req.body

    id = Number(id)
    productId = Number(productId)
    quantity = Number(quantity)

    if (isNaN(id) || isNaN(productId) || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ error: `Los ids y la cantidad deben ser numéricos y mayores a 0` })
    }

    try {
        let cart = await CartManager.addProductCart(id, productId, quantity)
        return res.status(200).json({ payload: `Producto agregado al carrito`, cart })
    } catch (error) {
        procesadorDeErrores500(res, error)
    }
})

// Modificar la cantidad de un producto
router.put("/:id/products/:productId", async (req, res) => {
    let { id, productId } = req.params
    let { quantity } = req.body

    id = Number(id)
    productId = Number(productId)
    quantity = Number(quantity)

    if (isNaN(id) || isNaN(productId) || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ error: `Los ids y la cantidad deben ser numéricos y mayores a 0` })
    }

    try {
        let cart = await CartManager.getCartById(id)
        if (!cart) {
            return res.status(404).json({ error: `Carrito con id ${id} no encontrado` })
        }

        let product = cart.products.find((p) => p.product === productId)
        if (!product) {
            return res.status(404).json({ error: `Producto con id ${productId} no encontrado en el carrito` })
        }

        product.quantity = quantity

        await CartManager.addProductCart(id, productId, quantity - product.quantity);
        return res.status(200).json({ payload: `Cantidad actualizada`, cart });
    } catch (error) {
        procesadorDeErrores500(res, error)
    }
})

// Eliminar un producto de un carrito
router.delete("/:id/products/:productId", async (req, res) => {
    let { id, productId } = req.params

    id = Number(id)
    productId = Number(productId)

    if (isNaN(id) || isNaN(productId)) {
        return res.status(400).json({ error: `Los ids deben ser numéricos` })
    }

    try {
        let cart = await CartManager.deleteProductCart(id, productId)
        return res.status(200).json({ payload: `Producto eliminado del carrito`, cart })
    } catch (error) {
        procesadorDeErrores500(res, error)
    }
})
