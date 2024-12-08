const express = require('express');
const cors = require('cors');
const session = require('express-session');
const app = express();

//Router
const authRoutes = require('./routes/auth');
const instalacionRoutes = require('./routes/instalaciones');
const generalRoutes = require('./routes/general');
const usuarioRoutes = require('./routes/usuarios');
const reservaRoutes = require('./routes/reservas');

require('dotenv').config();

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: 'MiCadenaSegura',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use('/api/auth', authRoutes);
app.use('/api/instalaciones', instalacionRoutes);
app.use('/api/general', generalRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/reservas', reservaRoutes);

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
