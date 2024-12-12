class ProductsManager {
    #products
    constructor() {
        this.#products = [
            // Vector de ejemplo
            { id: 1, code: "pr001", title: "Martillo", description: "abc", price: 20, thumbnail: "./image", stock: 5 }
        ]
    }

    // Agregar producto
    addProduct(code, title, description, price, thumbnail, stock) {
        // Validación de todos los campos
        if ((!code || !title || !description || !price || !thumbnail || !stock)) {
            return 'Completa la información'
        }

        // Validación de que no se repita el campo “code” 
        let existe = this.#products.find(product => product.code === code)
        if (existe) {
            console.log(`El producto con code ${code} ya existe en BD`)
            return
        }

        let id = 1
        if (this.#products.length > 0) {
            id = this.#products[this.#products.length - 1].id + 1
        }

        let nuevoProducto = { id, code, title, description, price, thumbnail, stock }
        this.#products.push(nuevoProducto)
        return nuevoProducto
    }

    // Devuelve el arreglo completo
    getProducts() {
        return this.#products
    }

    // Devuelve el arreglo que coincida con el id pedido
    getProductById(id) {
        let producto = this.#products.find(product => product.id === id)
        if (!producto) {
            return `No existe producto con id ${id}`
        }
        return producto
    }
}

const productManager = new ProductsManager()