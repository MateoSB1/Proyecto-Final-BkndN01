export const procesadorDeErrores500 = (res, error) => {
    console.log(error)
    res.setHeader('Content-Type', 'application/json')
    return res.status(500).json({ error: 'Internal Server Error' })
}

export const validarProducto = (producto) => {
    const errores = []

    if (!producto.title || typeof producto.title !== 'string' || producto.title.trim() === '') {
        errores.push('El campo "title" debe ser un string no vacío')
    }

    if (!producto.description || typeof producto.description !== 'string' || producto.description.trim() === '') {
        errores.push('El campo "description" debe ser un string no vacío')
    }

    if (!producto.code || typeof producto.code !== 'string' || producto.code.trim() === '') {
        errores.push('El campo "code" debe ser un string no vacío')
    }

    if (producto.price === undefined || typeof producto.price !== 'number' || producto.price <= 0) {
        errores.push('El campo "price" debe ser un número positivo')
    }

    if (producto.status === undefined || typeof producto.status !== 'boolean') {
        errores.push('El campo "status" debe ser un valor booleano (true o false)')
    }

    if (producto.stock === undefined || typeof producto.stock !== 'number' || producto.stock < 0) {
        errores.push('El campo "stock" debe ser un número igual o mayor a 0')
    }

    if (!producto.category || typeof producto.category !== 'string' || producto.category.trim() === '') {
        errores.push('El campo "category" debe ser un string no vacío')
    }

    if (!producto.thumbnails || producto.thumbnails.trim() === '') {
        errores.push('El campo "thumbnail" debe ser una URL válida')
    }

    return errores
}