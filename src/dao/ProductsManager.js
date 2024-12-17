import fs from "fs"
export class ProductsManager {
    static #productsPath = "";
    static #cartsPath = "";

    constructor() {}

    static setProductsPath(rutaArchivo) {
        ProductsManager.#productsPath = rutaArchivo;
    }

    static setCartsPath(rutaArchivo) {
        ProductsManager.#cartsPath = rutaArchivo;
    }

    // PRODUCTS

    // Devuelve el arreglo completo
    static async getProducts() {
        if (fs.existsSync(ProductsManager.#productsPath)) {
            return JSON.parse(await fs.promises.readFile(ProductsManager.#productsPath, { encoding: "utf-8" }))
        } else {
            return []
        }
    }

    // Devuelve el arreglo que coincida con el id pedido
    static async getProductById(id) {
        let products = await ProductsManager.getProducts()
        let product = products.find((p) => p.id === id)
        return product
    }

    // Devuelve el arreglo que coincida con el title pedido
    static async getProductByTitle(title){
        let products=await this.getProducts()
        let product=products.find(p=>p.title.toLowerCase()===title.trim().toLowerCase())
        return product
    }
    
    // Devuelve el arreglo que coincida con el codigo de producto pedido
    static async getProductByCodeProduct(code){
        let products=await this.getProducts()
        let product=products.find(p=>p.code.toLowerCase()===code.trim().toLowerCase())
        return product
    }

    // Agregar producto
    static async addProduct(product = {}) {
        let products = await ProductsManager.getProducts()
        let id = 1
        if (products.length > 0) {
            id = products[products.length - 1].id + 1
        }
        let nuevoProduct = {
            id,
            ...product,
        }
        products.push(nuevoProduct)

        await ProductsManager.#cargarArchivoProduct(JSON.stringify(products, null, "\t"))

        return nuevoProduct
    }

    // Editar producto
    static async editProduct(id, modificaciones = {}) {
        let products = await ProductsManager.getProducts()
        let indiceProduct = products.findIndex((p) => p.id === id)
        if (indiceProduct === -1) {
            throw new Error(`Producto inexistente con id ${id}`)
        }

        products[indiceProduct] = {
            ...products[indiceProduct],
            ...modificaciones,
            id,
        }

        await ProductsManager.#cargarArchivoProduct(JSON.stringify(products, null, "\t"))
        return products[indiceProduct]
    }

    // Eliminar producto por id
    static async deleteProduct(id) {
        let products = await ProductsManager.getProducts()

        let indiceProduct = products.findIndex((p) => p.id === id)
        if (indiceProduct === -1) {
            throw new Error(`Producto inexistente con id ${id}`)
        }

        let [productoEliminado] = products.splice(indiceProduct, 1)

        await ProductsManager.#cargarArchivoProduct(JSON.stringify(products, null, "\t"))

        return productoEliminado
    }

    // Función para cargar archivo de products
    static async #cargarArchivoProduct(datos = "") {
        if (typeof datos !== "string") {
            throw new Error(`Error archivo inválido`)
        }
        await fs.promises.writeFile(ProductsManager.#productsPath, datos)
    }

    // CARTS

    // Devuelve el arreglo que coincida con el id pedido
    static async getCartById(id) {
        let carts = await ProductsManager.getCarts();
        let cart = carts.find((c) => c.id === id);
        return cart
    }

    // Agregar carrito
    static async addCart() {
        let carts = await ProductsManager.getCarts();
        let id = 1;
        if (carts.length > 0) {
            id = carts[carts.length - 1].id + 1;
        }
    
        let newCart = {
            id,
            products: []
        };
    
        carts.push(newCart);
    
        await ProductsManager.#cargarArchivoCart(JSON.stringify(carts, null, "\t"))
        return newCart;
    }
    
    // Agregar producto al carrito
    static async addProductCart(cartId, productId, quantity) {
        let carts = JSON.parse(await fs.promises.readFile(ProductsManager.#cartsPath, "utf-8"));
        let cart = await ProductsManager.getCartById(cartId);
    
        if (!cart) throw new Error(`Carrito con id ${cartId} no encontrado`);
    
        let productIndex = cart.products.findIndex((p) => p.product === productId);
    
        let updatedProducts = [...cart.products];
        if (productIndex !== -1) {
            updatedProducts[productIndex].quantity += quantity;
        } else {
            updatedProducts.push({ product: productId, quantity });
        }
        cart.products = updatedProducts;        
    
        // Reemplaza el carrito modificado en la lista
        carts = carts.map((c) => (c.id === cartId ? cart : c));
    
        await ProductsManager.#cargarArchivoCart(JSON.stringify(carts, null, "\t"))
        return cart;
    }
    
    // Eliminar producto del carrito por id
    static async deleteProductCart(cartId, productId) {
        let carts = JSON.parse(await fs.promises.readFile(ProductsManager.#cartsPath, "utf-8"));
        let cart = await ProductsManager.getCartById(cartId);
    
        if (!cart) throw new Error(`Carrito con id ${cartId} no encontrado`);
    
        cart.products = cart.products.filter((p) => p.product !== productId);
    
        // Reemplaza el carrito modificado en la lista
        carts = carts.map((c) => (c.id === cartId ? cart : c));
    
        await ProductsManager.#cargarArchivoCart(JSON.stringify(carts, null, "\t"))
        return cart;
    }

    // Función para cargar archivo de products
    static async #cargarArchivoCart(datos = "") {
        if (typeof datos !== "string") {
            throw new Error(`Error archivo inválido`)
        }
        await fs.promises.writeFile(ProductsManager.#cartsPath, datos)
    }

}
