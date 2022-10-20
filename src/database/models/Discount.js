module.exports = (sequelize, DataTypes) => {
    let alias = 'Discount';
    let cols = {
        id: { 
            type: DataTypes.INTEGER.UNSIGNED,
            unique: true,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        category_id : {
            type : DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        brand_id : {
            type : DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        discount : {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue : 0
        }
    };
    let config = {
        timestamps: true,
        underscored: true,
    }
    const Discount = sequelize.define(alias, cols , config)
        
    return Discount
}