module.exports = (sequelize, DataTypes) => {
    const Pic = sequelize.define('pic', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }, 
        description: {
            type: DataTypes.STRING,
        },
        username: {
            type: DataTypes.STRING,
        },
        image: {
            type: DataTypes.STRING,
        },
        comment: {
            type: DataTypes.STRING
        },
        tag: {
            type: DataTypes.STRING
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        underscored: true
    })
    return Pic;
}