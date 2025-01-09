import fs from "fs"
export class CartManager {
    static #cartsPath = ""

    static setCartsPath(rutaArchivo) {
        CartManager.#cartsPath = rutaArchivo
    }

    // Devuelve el arreglo completo
    static async getCarts() {
        if (fs.existsSync(CartManager.#cartsPath)) {
            return JSON.parse(await fs.promises.readFile(CartManager.#cartsPath, { encoding: "utf-8" }))
        } else {
            return []
        }
    }

    // Devuelve el arreglo que coincida con el id pedido
    static async getCartById(id) {
        let carts = await ProductsManager.getCarts()
        let cart = carts.find((c) => c.id === id)
        return cart
    }

    // Agregar carrito
    static async addCart() {
        let carts = await ProductsManager.getCarts()
        let id = 1
        if (carts.length > 0) {
            id = carts[carts.length - 1].id + 1
        }
    
        let newCart = {
            id,
            products: []
        }
    
        carts.push(newCart)
    
        await ProductsManager.#cargarArchivoCart(JSON.stringify(carts, null, "\t"))
        return newCart
    }
    
    // Agregar producto al carrito
    static async addProductCart(cartId, productId, quantity) {
        let carts = JSON.parse(await fs.promises.readFile(ProductsManager.#cartsPath, "utf-8"))
        let cart = await ProductsManager.getCartById(cartId)
    
        if (!cart) throw new Error(`Carrito con id ${cartId} no encontrado`)
    
        let productIndex = cart.products.findIndex((p) => p.product === productId)
    
        let updatedProducts = [...cart.products]
        if (productIndex !== -1) {
            updatedProducts[productIndex].quantity += quantity
        } else {
            updatedProducts.push({ product: productId, quantity })
        }
        cart.products = updatedProducts        
    
        // Reemplaza el carrito modificado en la lista
        carts = carts.map((c) => (c.id === cartId ? cart : c))
    
        await ProductsManager.#cargarArchivoCart(JSON.stringify(carts, null, "\t"))
        return cart
    }
    
    // Eliminar producto del carrito por id
    static async deleteProductCart(cartId, productId) {
        let carts = JSON.parse(await fs.promises.readFile(ProductsManager.#cartsPath, "utf-8"))
        let cart = await ProductsManager.getCartById(cartId)
    
        if (!cart) throw new Error(`Carrito con id ${cartId} no encontrado`)
    
        cart.products = cart.products.filter((p) => p.product !== productId)
    
        // Reemplaza el carrito modificado en la lista
        carts = carts.map((c) => (c.id === cartId ? cart : c))
    
        await ProductsManager.#cargarArchivoCart(JSON.stringify(carts, null, "\t"))
        return cart
    }

    // Función para cargar archivo de products
    static async #cargarArchivoCart(datos = "") {
        if (typeof datos !== "string") {
            throw new Error(`Error archivo inválido`)
        }
        await fs.promises.writeFile(ProductsManager.#cartsPath, datos)
    }

}
