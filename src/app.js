import express from 'express';
import { router as productsRouter } from "./routes/productsRouter.js"
import { router as cartsRouter } from "./routes/cartsRouter.js"
const PORT = 8080;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('OK');
})

const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
