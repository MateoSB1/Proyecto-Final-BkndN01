import fs from "fs"
export class ProductsManager {
    static #productsPath = "";

    static setProductsPath(rutaArchivo) {
        ProductsManager.#productsPath = rutaArchivo;
    }

    // Devuelve el arreglo completo
    static async getProducts() {
        if (fs.existsSync(ProductsManager.#productsPath)) {
            return JSON.parse(await fs.promises.readFile(ProductsManager.#productsPath, { encoding: "utf-8" }));
        } else {
            return [];
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

}
