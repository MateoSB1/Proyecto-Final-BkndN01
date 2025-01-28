import { Router } from "express"
import { CartMongoManager as CartManager } from "../dao/CartMongoManager.js"
import { procesadorDeErrores500 } from "../utils.js"

const router = Router()

router.get("/", async (req, res) => {
    try {
        const carts = await CartManager.getAllCarts(); // Implementar método en CartMongoManager
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ carts });
    } catch (error) {
        console.error("Error al obtener los carritos:", error);
        procesadorDeErrores500(res, error);
    }
});

router.get("/:cid", async (req, res) => {
    try {
        const cart = await CartManager.getCartById(req.params.cid)
        if (!cart) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ error: 'Carrito no encontrado' })
        }
        res.setHeader('Content-Type', 'application/json')
        return res.status(200).json({ cart })
    } catch (error) {
        console.error("Error al obtener carrito por ID:", error)
        procesadorDeErrores500(res, error)
    }
})

router.post("/", async (req, res) => {
    try {
        const newCart = await CartManager.addCart()
        res.status(201).json({ payload: `Carrito creado exitosamente`, newCart })
    } catch (error) {
        console.error("Error al crear carrito:", error)
        procesadorDeErrores500(res, error)
    }
})

router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const updatedCart = await CartManager.addProductCart(req.params.cid, req.params.pid);
        res.status(200).json({ message: "Producto agregado al carrito.", updatedCart });
    } catch (error) {
        console.error("Error al agregar producto al carrito:", error);
        procesadorDeErrores500(res, error);
    }
});

router.put('/:cid', async (req, res) => {
    try {
        const updatedCart = await CartManager.updateCart(req.params.cid, req.body.products)
        return res.status(200).json({ payload: `Carrito actualizado`, updatedCart })
    } catch (error) {
        console.error("Error al actualizar carrito:", error)
        procesadorDeErrores500(res, error)
    }
})

router.put('/:cid/products/:pid', async (req, res) => {
    const { quantity } = req.body
    try {
        const updatedCart = await CartManager.updateProductQuantity(req.params.cid, req.params.pid, quantity)
        return res.status(200).json({ payload: `Carrito actualizado`, updatedCart })
    } catch (error) {
        console.error("Error al actualizar la cantidad de productos en el carrito:", error)
        procesadorDeErrores500(res, error)
    }
})

router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const updatedCart = await CartManager.deleteProductCart(req.params.cid, req.params.pid)
        return res.status(200).json({ payload: `Producto del carrito eliminado`, updatedCart })
    } catch (error) {
        console.error("Error al eliminar el producto del carrito:", error)
        procesadorDeErrores500(res, error)
    }
})

router.delete('/:cid', async (req, res) => {
    try {
        const updatedCart = await CartManager.clearCart(req.params.cid)
        return res.status(200).json({ payload: `Carrito limpiado`, updatedCart })
    } catch (error) {
        console.error("Error limpiando el carrito:", error)
        procesadorDeErrores500(res, error)
    }
})

export default router
