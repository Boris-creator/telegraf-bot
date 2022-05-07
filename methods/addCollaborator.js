const { Collaborator } = require("../sequelize.js");
module.exports = async function(){
    await Collaborator.create({
        mail: "mail.ru",
        
    })
}