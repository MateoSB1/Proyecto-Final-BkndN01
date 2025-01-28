import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    code: { type: String, unique: true },
    status: Boolean,
    stock: Number,
    category: String,
    thumbnails: [String],
}, { timestamps: true })

productSchema.plugin(mongoosePaginate)

const Product = mongoose.model('Product', productSchema)

export default Product
