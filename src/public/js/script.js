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

socket.on("products", (data) => {
    renderProducts(data)
})

const renderProducts = (data) => {
    const productsContainer = document.getElementById("productsContainer")
    productsContainer.innerHTML = ""

    data.forEach(item => {
        const card = document.createElement("div")
        card.classList.add("card", "custom-border", "custom-rounded", "custom-shadow", "margin-bottom")

        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">Título: ${item.title}</h5>
                <p class="card-text">Descripción: ${item.description.slice(0, 75)}...</p>
                <ul class="list-group">
                    <li class="list-group-item">
                        <span class="label">Precio:</span> ${item.price}
                    </li>
                    <li class="list-group-item">
                        <span class="label">Código:</span> ${item.code}
                    </li>
                    <li class="list-group-item">
                        <span class="label">Estado:</span> ${item.status ? 'Activo' : 'Inactivo'}
                    </li>
                    <li class="list-group-item">
                        <span class="label">Stock:</span> ${item.stock}
                    </li>
                    <li class="list-group-item">
                        <span class="label">Categoría:</span> ${item.category}
                    </li>
                </ul>
                <div class="button-container">
                    <button class="btn" onclick="deleteProduct('${item.id}')">Eliminar</button>
                </div>
            </div>
        `

        productsContainer.appendChild(card)
    })
}
  

const deleteProduct = (id) => {
    socket.emit("deleteProduct", id)
}

document.getElementById("add-product-form").addEventListener("submit", (event) => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const product = {
        title: formData.get("title"),
        description: formData.get("description"),
        price: formData.get("price"),
        code: formData.get("code"),
        stock: formData.get("stock"),
        category: formData.get("category"),
        thumbnail: formData.get("thumbnail"),
        status: formData.get("status") === "true" ? true : false, 
    }

    socket.emit("addProduct", product)
    event.target.reset() 
})
