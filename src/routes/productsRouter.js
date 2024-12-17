import { Router } from "express"
import { ProductsManager } from "../dao/ProductsManager.js"
import { procesadorDeErrores500, validarProducto } from "../utils.js"

export const router = Router()

ProductsManager.setProductsPath("./src/data/products.json")

router.get("/", async (req, res) => {
    try {
        let products = await ProductsManager.getProducts()

        res.setHeader('Content-Type', 'application/json')
        return res.status(200).json({ products })

    } catch (error) {
        procesadorDeErrores500(res, error)
    }
})

router.get("/:id", async (req, res) => {

    let { id } = req.params
    id = Number(id)
    if (isNaN(id)) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(400).json({ error: `Complete con un id numérico` })
    }

    try {
        let product = await ProductsManager.getProductById(id)
        if (!product) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ error: `No existe product con id ${id}` })
        }

        res.setHeader('Content-Type', 'application/json')
        return res.status(200).json({ product })
    } catch (error) {
        procesadorDeErrores500(res, error)
    }

})

router.post("/", async (req, res) => {

    let { code, title, description, price, status, stock, category, thumbnail } = req.body
    if ((!title || !description || !code || !price || !status || !stock || !category || !thumbnail)) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(400).json({ error: 'Completa la información' })
    }

    // Validaciones individuales de tipo de dato
    const errores = validarProducto({ code, title, description, price, status, stock, category, thumbnail })

    // Si hay errores, devolver la lista
    if (errores.length > 0) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(400).json({ error: 'Error en los datos enviados'})
    }

    // Verificación si ya existe el producto con el mismo código
    try {
        let existe = await ProductsManager.getProductByCodeProduct(code)
        if (existe) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(400).json({ error: `Ya existe el producto con código ${code}` })
        }

        let nuevoProducto = await ProductsManager.addProduct({ code, title, description, price, status, stock, category, thumbnail })

        res.setHeader('Content-Type', 'application/json')
        return res.status(201).json({ payload: `Producto dado de alta exitosamente!`, nuevoProducto })
    } catch (error) {
        procesadorDeErrores500(res, error)
    }

})

router.put("/:id", async (req, res) => {
    let { id } = req.params
    id = Number(id)
    if (isNaN(id)) {
        return res.status(400).json({ error: `Complete con un id numérico` })
    }

    let aModificar = req.body
    if (aModificar.id) {
        return res.status(400).json({ error: 'No está permitido modificar el id' })
    }

    // Validaciones de tipo de dato
    const errores = validarProducto(aModificar)
    if (errores.length > 0) {
        return res.status(400).json({ error: 'Error en los datos enviados', detalles: errores })
    }

    try {
        if (aModificar.code) {
            let products = await ProductsManager.getProducts()
            let existe = products.find(p => p.code.toLowerCase() === aModificar.code.trim().toLowerCase() && p.id !== id)

            if (existe) {
                return res.status(400).json({ error: `Ya existe un producto con código ${aModificar.code}. Tiene id ${existe.id}` })
            }
        }

        let productModificado = await ProductsManager.editProduct(id, aModificar)
        return res.status(200).json({ payload: `Se modificó el producto con id ${id}`, productModificado })
    } catch (error) {
        procesadorDeErrores500(res, error)
    }
})

router.delete("/:id", async (req, res) => {
    let { id } = req.params
    id = Number(id)
    if (isNaN(id)) {
        return res.status(400).json({ error: 'El id debe ser numérico' })
    }

    try {
        let eliminado = await ProductsManager.deleteProduct(id)
        return res.status(200).json({ payload: `Se eliminó el producto con id ${id}`, eliminado })
    } catch (error) {
        procesadorDeErrores500(res, error)
    }
})
