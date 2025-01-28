import Cart from './models/cartModel.js'

export class CartMongoManager {
    static async addCart() {
        try {
            const cart = new Cart()
            return await cart.save()
        } catch (error) {
            console.error("Error al crear el carrito:", error)
            throw new Error("Error al crear el carrito")
        }
    }

    static async getAllCarts() {
        try {
            return await Cart.find().populate('products.product');
        } catch (error) {
            console.error("Error al obtener todos los carritos:", error);
            throw new Error("Error al obtener todos los carritos");
        }
    }    

    static async getCartById(id) {
        try {
            return await Cart.findById(id).populate('products.product'); // Incluye los datos del producto
        } catch (error) {
            console.error("Error al obtener el carrito por ID:", error);
            throw new Error("Error al obtener el carrito por ID");
        }
    }    

    static async addProductCart(cid, pid) {
        try {
            const cart = await Cart.findById(cid)
            if (!cart) throw new Error("Carrito no encontrado")

            const productIndex = cart.products.findIndex(p => p.product.toString() === pid)

            if (productIndex > -1) {
                cart.products[productIndex].quantity += 1
            } else {
                cart.products.push({ product: pid, quantity: 1 })
            }

            return await cart.save()
        } catch (error) {
            console.error("Error al agregar producto al carrito:", error)
            throw new Error("Error al agregar producto al carrito")
        }
    }
    
    static async deleteProductCart(cid, pid) {
        try {
            const cart = await Cart.findById(cid)
            if (!cart) throw new Error("Carrito no encontrado")

            cart.products = cart.products.filter(p => p.product.toString() !== pid)
            return await cart.save()
        } catch (error) {
            console.error("Error al eliminar producto del carrito:", error)
            throw new Error("Error al eliminar producto del carrito")
        }
    }

    static async updateCart(cid, products) {
        try {
            const cart = await Cart.findById(cid)
            if (!cart) throw new Error("Carrito no encontrado")

            cart.products = products
            return await cart.save()
        } catch (error) {
            console.error("Error al actualizar el carrito:", error)
            throw new Error("Error al actualizar el carrito")
        }
    }

    static async updateProductQuantity(cid, pid, quantity) {
        try {
            const cart = await Cart.findById(cid)
            if (!cart) throw new Error("Carrito no encontrado")

            const productIndex = cart.products.findIndex(p => p.product.toString() === pid)

            if (productIndex > -1) {
                cart.products[productIndex].quantity = quantity
            } else {
                cart.products.push({ product: pid, quantity })
            }

            return await cart.save()
        } catch (error) {
            console.error("Error al actualizar la cantidad del producto en el carrito:", error)
            throw new Error("Error al actualizar la cantidad del producto en el carrito")
        }
    }

    static async clearCart(cid) {
        try {
            const cart = await Cart.findById(cid)
            if (!cart) throw new Error("Carrito no encontrado")

            cart.products = []
            return await cart.save()
        } catch (error) {
            console.error("Error al vaciar el carrito:", error)
            throw new Error("Error al vaciar el carrito")
        }
    }
}