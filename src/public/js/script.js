// NavBar
const mobileNav = document.querySelector(".menu-hamburger");
const navbar = document.querySelector(".menubar");

const toggleNav = () => {
    navbar.classList.toggle("active");
    mobileNav.classList.toggle("menu-hamburger-active");
};

if (mobileNav && navbar) {
    mobileNav.addEventListener("click", () => toggleNav());
}

window.addEventListener("resize", () => {
    if (window.innerWidth > 790 && navbar && navbar.classList.contains("active")) {
        navbar.classList.remove("active");
        mobileNav.classList.remove("menu-hamburger-active");
    }
});



const socket = io();

socket.on("products", (data, totalPages, currentPage) => {
    renderProducts(data, totalPages, currentPage);
});

socket.on("paginatedProducts", (data, totalPages, currentPage) => {
    renderProducts(data, totalPages, currentPage);
});

const renderProducts = (data, totalPages, currentPage) => {
    const productsContainer = document.getElementById("productsContainer");

    if (productsContainer) {
        productsContainer.innerHTML = "";

        data.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("card");
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
                        <button class="btn-rtproducts" onclick="deleteProduct('${item._id}')">Eliminar</button>
                    </div>
                </div>
            `;
            productsContainer.appendChild(card);
        });

        const paginationContainer = document.querySelector(".pagination-container");
        if (paginationContainer) {
            paginationContainer.innerHTML = `
                ${currentPage > 1 ? `<button class="pagination-button" onclick="requestPage(${currentPage - 1})">Anterior</button>` : `<span class="pagination-button disabled">Anterior</span>`}
                <span class="pagination-info">Página ${currentPage} de ${totalPages}</span>
                ${currentPage < totalPages ? `<button class="pagination-button" onclick="requestPage(${currentPage + 1})">Siguiente</button>` : `<span class="pagination-button disabled">Siguiente</span>`}
            `;
        }
    }
};

const requestPage = (page) => {
    socket.emit("requestProductsPage", page);
};

const deleteProduct = (id) => {
    if (!id) {
        return;
    }
    socket.emit("deleteProduct", id);
};

const addProductForm = document.getElementById("add-product-form");

if (addProductForm) {
    addProductForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const thumbnailsRaw = formData.get("thumbnail");
        const product = {
            code: formData.get("code"),
            title: formData.get("title"),
            description: formData.get("description"),
            price: parseFloat(formData.get("price")),
            stock: parseInt(formData.get("stock"), 10),
            category: formData.get("category"),
            thumbnails: thumbnailsRaw.split(",").map(url => url.trim()),
            status: formData.get("status") === "true"
        };

        socket.emit("addProduct", product);
        event.target.reset();
    });
}

const createCart = async () => {
    try {
        const response = await fetch("/api/carts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Error al crear el carrito");
        }

        const data = await response.json();
        console.log("Carrito creado:", data);

        if (data.newCart && data.newCart._id) {
            window.location.href = `/carts/${data.newCart._id}`;
        } else {
            alert("Carrito creado exitosamente 🛒");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al crear el carrito. Inténtalo de nuevo.");
    }
};

const addCartButton = document.getElementById("add-cart");

if (addCartButton) {
    addCartButton.addEventListener("click", createCart);
}

const goToLastCart = async () => {
    try {
        const response = await fetch("/api/carts");
        if (!response.ok) {
            throw new Error("Error al obtener los carritos");
        }

        const data = await response.json();
        const carts = data.carts;

        if (carts.length > 0) {
            const lastCart = carts[carts.length - 1];
            window.location.href = `/carts/${lastCart._id}`;
        } else {
            window.location.href = "/carts";
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al obtener los carritos. Inténtalo de nuevo.");
    }
};

const goToCartLink = document.getElementById("go-to-cart");

if (goToCartLink) {
    goToCartLink.addEventListener("click", (event) => {
        event.preventDefault();
        goToLastCart();
    });
}

const addToCart = async (productId) => {
    const quantity = document.getElementById(`quantity-${productId}`).value;

    try {
        const cartsResponse = await fetch("/api/carts");
        if (!cartsResponse.ok) {
            throw new Error("Error al obtener los carritos");
        }
        const cartsData = await cartsResponse.json();
        const carts = cartsData.carts;

        if (carts.length === 0) {
            const newCartResponse = await fetch("/api/carts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!newCartResponse.ok) {
                throw new Error("Error al crear un nuevo carrito");
            }
            const newCartData = await newCartResponse.json();
            const newCartId = newCartData.newCart._id;

            socket.emit("addProductToCart", { cartId: newCartId, productId, quantity: parseInt(quantity, 10) });
        } else {
            const lastCartId = carts[carts.length - 1]._id;

            socket.emit("addProductToCart", { cartId: lastCartId, productId, quantity: parseInt(quantity, 10) });
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al agregar el producto al carrito. Inténtalo de nuevo.");
    }
};

socket.on("cartUpdated", (updatedCart) => {
    console.log("Carrito actualizado:", updatedCart);
    updateCartUI(updatedCart);
});

const updateCartUI = (cart) => {
    const cartColumn = document.querySelector(".cart-column");
    if (!cartColumn) return;

    cartColumn.innerHTML = `
        <h3 class="title-products">Carrito</h3>
        <div class="cart-details">
            <h3 class="cart-details-h3">ID: ${cart._id}</h3>
            <p class="cart-card-p">Productos:</p>
            <ul class="cart-details-ul">
                ${cart.products.map(product => `
                    <li class="cart-details-li">
                        ${product.product.title} - Cantidad: ${product.quantity}
                    </li>
                `).join("")}
            </ul>
        </div>
    `;
};