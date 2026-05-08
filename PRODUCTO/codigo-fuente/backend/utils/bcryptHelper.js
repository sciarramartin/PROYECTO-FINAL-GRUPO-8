// utils/bcryptHelper.js
const bcrypt = require('bcrypt');

class BcryptHelper {

    async comparar(contraseñaPlana, contraseñaHash) {
        return await bcrypt.compare(contraseñaPlana, contraseñaHash);
    }

    async hashear(contraseña) {
        return await bcrypt.hash(contraseña, 10);
    }

}

module.exports = { BcryptHelper };