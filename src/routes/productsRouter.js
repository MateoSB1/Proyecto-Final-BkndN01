import { Router } from "express"
import { ProductsMongoManager as ProductManager } from "../dao/ProductsMongoManager.js"
import { procesadorDeErrores500 } from "../utils.js"

const router = Router()

router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, category, availability } = req.query
    try {
        const products = await ProductManager.getProducts({
            limit, page, sort, query: { category, availability }
        })
        return res.status(200).json({
            status: 'success',
            payload: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `/api/products?limit=${limit}&page=${products.prevPage}&sort=${sort}&category=${category}&availability=${availability}` : null,
            nextLink: products.hasNextPage ? `/api/products?limit=${limit}&page=${products.nextPage}&sort=${sort}&category=${category}&availability=${availability}` : null
        })
    } catch (error) {
        console.error("Error al obtener productos:", error)
        procesadorDeErrores500(res, error)
    }
})

router.get('/:pid', async (req, res) => {
    try {
        const product = await ProductManager.getProductById(req.params.pid)
        if (!product) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ error: 'Producto no encontrado' })
        }
        res.setHeader('Content-Type', 'application/json')
        return res.status(200).json({ product })
    } catch (error) {
        console.error("Error al obtener producto por ID:", error)
        procesadorDeErrores500(res, error)
    }
})

router.post('/', async (req, res) => {
    try {
        const newProduct = await ProductManager.addProduct(req.body)
        res.setHeader('Content-Type', 'application/json')
        return res.status(201).json({ payload: `Producto dado de alta exitosamente!`, newProduct })
    } catch (error) {
        console.error("Error al agregar producto:", error)
        procesadorDeErrores500(res, error)
    }
})

router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await ProductManager.updateProduct(req.params.pid, req.body)
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }
        return res.status(200).json({ payload: 'Producto modificado', updatedProduct })
    } catch (error) {
        console.error("Error al actualizar producto:", error)
        procesadorDeErrores500(res, error)
    }
})

router.delete('/:pid', async (req, res) => {
    try {
        const deletedProduct = await ProductManager.deleteProduct(req.params.pid)
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }
        return res.status(200).json({ payload: 'Producto eliminado', deletedProduct })
    } catch (error) {
        console.error("Error al eliminar producto:", error)
        procesadorDeErrores500(res, error)
    }
})

export default router
