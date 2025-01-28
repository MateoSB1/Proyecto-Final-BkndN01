import Product from './models/productsModel.js'

export class ProductsMongoManager {
    static async getProducts({ limit = 10, page = 1, sort, query } = {}) {
        try {
            const options = {
                limit: parseInt(limit, 10),
                page: parseInt(page, 10),
                sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
            }

            const filters = {}
            if (query) {
                if (query.category) {
                    filters.category = query.category
                }
                if (query.availability !== undefined) {
                    filters.status = query.availability === 'true'
                }
            }

            const productsData = await Product.paginate(filters, options)
            return productsData
        } catch (error) {
            console.error("Error al obtener los productos:", error)
            throw new Error("Error al obtener los productos")
        }
    }

    static async getProductById(id) {
        try {
            return await Product.findById(id)
        } catch (error) {
            console.error("Error al obtener el producto por ID:", error)
            throw new Error("Error al obtener los productos por ID")
        }
    }

    static async addProduct(productData) {
        try {
            const existingProduct = await Product.findOne({ code: productData.code })
            if (existingProduct) {
                console.error("El código del producto ya existe")
                throw new Error("El código del producto ya existe")
            }
            const product = new Product(productData)
            return await product.save()
        } catch (error) {
            console.error("Error al agregar el producto:", error)
            throw new Error("Error al agregar el producto")
        }
    }

    static async updateProduct(id, updatedFields) {
        try {
            const existingProduct = await Product.findOne({
                code: updatedFields.code,
                _id: { $ne: id },
            })

            if (existingProduct) {
                console.error("El código del producto ya existe")
                throw new Error("El código del producto ya existe")
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                updatedFields,
                { new: true }
            )

            if (!updatedProduct) {
                throw new Error("Producto no encontrado")
            }

            return updatedProduct
        } catch (error) {
            console.error("Error al actualizar el producto:", error)
            throw new Error("Error al actualizar el producto")
        }
    }

    static async deleteProduct(id) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(id);
            if (!deletedProduct) {
                throw new Error("Producto no encontrado");
            }
            return deletedProduct;
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            throw new Error("Error al eliminar el producto");
        }
    }
}
