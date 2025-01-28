// NavBar
const mobileNav = document.querySelector(".menu-hamburger")
const navbar = document.querySelector(".menubar")

const toggleNav = () => {
    navbar.classList.toggle("active")
    mobileNav.classList.toggle("menu-hamburger-active")
}

mobileNav.addEventListener("click", () => toggleNav())

window.addEventListener("resize", () => {
    if (window.innerWidth > 790 && navbar.classList.contains("active")) {
        navbar.classList.remove("active")
        mobileNav.classList.remove("menu-hamburger-active")
    }
})

/* REALTIMEPRODUCTS.HANDLEBARS */
const socket = io()

socket.on("products", (data, totalPages, currentPage) => {
    renderProducts(data, totalPages, currentPage)
})

socket.on("paginatedProducts", (data, totalPages, currentPage) => {
    renderProducts(data, totalPages, currentPage)
})

const renderProducts = (data, totalPages, currentPage) => {
    const productsContainer = document.getElementById("productsContainer")
    productsContainer.innerHTML = ""

    data.forEach(item => {
        const card = document.createElement("div")
        card.classList.add("card")
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">Título: ${item.title}</h5>
                <p class="card-text">Descripción: ${item.description.slice(0, 75)}...</p>
                <ul class="list-group">
                    <li class="list-group-item">Precio: ${item.price}</li>
                    <li class="list-group-item">Código: ${item.code}</li>
                    <li class="list-group-item">Estado: ${item.status ? 'Activo' : 'Inactivo'}</li>
                    <li class="list-group-item">Stock: ${item.stock}</li>
                    <li class="list-group-item">Categoría: ${item.category}</li>
                </ul>
                <div class="button-container">
                    <button class="btn-rtproducts" onclick="deleteProduct(${item.id})">Eliminar</button>
                </div>
            </div>
        `
        productsContainer.appendChild(card)
    })

    const paginationContainer = document.querySelector(".pagination-container")
    paginationContainer.innerHTML = `
        ${currentPage > 1 ? `<button class="pagination-button" onclick="requestPage(${currentPage - 1})">Anterior</button>` : `<span class="pagination-button disabled">Anterior</span>`}
        <span class="pagination-info">Página ${currentPage} de ${totalPages}</span>
        ${currentPage < totalPages ? `<button class="pagination-button" onclick="requestPage(${currentPage + 1})">Siguiente</button>` : `<span class="pagination-button disabled">Siguiente</span>`}
    `
}

const requestPage = (page) => {
    socket.emit("requestProductsPage", page)
}

const deleteProduct = (id) => {
    if (!id) {
        return
    }
    socket.emit("deleteProduct", id)
}

document.getElementById("add-product-form").addEventListener("submit", (event) => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const thumbnailsRaw = formData.get("thumbnail")
    const product = {
        code: formData.get("code"),
        title: formData.get("title"),
        description: formData.get("description"),
        price: parseFloat(formData.get("price")),
        stock: parseInt(formData.get("stock"), 10),
        category: formData.get("category"),
        thumbnails: thumbnailsRaw.split(",").map(url => url.trim()),
        status: formData.get("status") === "true"
    }

    socket.emit("addProduct", product)
    event.target.reset()
})

// Manejo de agregar al carrito
document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("btn-add-to-cart")) {
        const productId = event.target.getAttribute("data-id")
        const lastCartId = document.querySelector(".cart-details h3").textContent.split("ID: ")[1]

        if (!productId || !lastCartId) {
            alert("No se pudo encontrar el carrito o el producto.")
            return
        }

        try {
            const response = await fetch(`/api/carts/${lastCartId}/products/${productId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })

            if (response.ok) {
                alert("Producto agregado al carrito exitosamente.")
                location.reload()
            } else {
                const error = await response.json()
                alert(`Error: ${error.error}`)
            }
        } catch (error) {
            console.error("Error al agregar el producto al carrito:", error)
        }
    }
})
