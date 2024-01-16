const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
    const hash= await bcrypt.hash(password, 10);
    return hash;
}
const comparePassword = async ( password,hashed) => {
    const compare = await bcrypt.compare(password, hashed);
    return compare;
}
module.exports = {hashPassword, comparePassword}