import mongoose from "mongoose"

export const connectDB = async(url, dbName)=>{
    try {
        await mongoose.connect(
            url,
            {
                dbName: dbName
            }
        )
        console.log(`DB Online!`)
    } catch (error) {
        console.log('Error al conectar a la db')
    }
}

export default connectDB