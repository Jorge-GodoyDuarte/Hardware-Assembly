const db = require("../database/models");
const sequelize = db.sequelize;

const { name } = require("ejs");
const { search } = require("../routes");

const products = require("../data/db_Module").loadProducts();
const brands = require("../data/db_Module").loadBrands();
const toThousand = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const {
  storeProducts,
  loadBrands,
  loadProducts,
  loadCategory,
} = require("../data/db_Module");
const { validationResult } = require("express-validator");
const { Association } = require("sequelize");

module.exports = {
  create: (req, res) => {
    // Do the magic
    let categories = db.Category.findAll({
      order: ["name"],
    });
    let brands = db.Brand.findAll({
      order: ["name"],
    });
    Promise.all([categories, brands])
      .then(([categories, brands]) => {
        return res.render("productAdd", {
          categories,
          brands,
        });
      })
      .catch((error) => console.log(error));
  },
  detail: (req, res) => {
    // Do the magic
    let products = db.Product.findByPk(req.params.id, {
        include : ['marcas']
    });
    let images = db.Image.findByPk(req.params.id);

    Promise.all([products, images, brands])
      .then(([products, images, brands]) => {
        return res.render("detail", {
          products,
          images,
          brands,
          toThousand,
        });
      })
      .catch((error) => console.log(error));
  },
  store: (req, res) => {
    const { name, price, discount, description, brand_id, categories_id } =
      req.body;
    db.Product.create({
      name : name.trim(),
      price: +price,
      discount: +discount,
      description : description.trim(),
      brand_id: +brand_id,
      categories_id: +categories_id,
    })
      .then((product) => {
        return res.redirect("/products/detail/" + product.id);
      })
      .catch((error) => console.log(error));
  },

  editProduct: (req, res) => {
    /*   const product = products.find(product => product.id === +req.params.id); */
    let products = db.Product.findByPk(req.params.id, {
      include: ["images"],
    });
    let categories = db.Category.findAll();
    let brands = db.Brand.findAll();
    Promise.all([products, categories, brands])
      .then(([products, categories, brands]) => {
        res.render("productEdit", {
          products,
          categories,
          brands,
        });
      })
      .catch((error) => console.log(error));
  },
  updateEdit: (req, res) => {
    const { name, price, discount, description, brand_id, categories_id } = req.body;

    db.Product.update(
      {
        name: name.trim(),
        price: +price,
        discount: +discount,
        description: description.trim(),
        brand_id: +brand_id,
        categories_id: +categories_id,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    )
      .then((product) => {
        return res.redirect("/products/detail/" + product.id);
      })
      .catch((error) => console.log(error));
  },
  
   remove : (req, res) => {

		db.Product.destroy({
			where : {
				id : req.params.id
			}
		})
			.then(() => {
				return res.redirect('/');
			})
			.catch(error => console.log(error))
    
} ,

/*  
    updateEdit : (req,res) => {
        let errors = validationResult(req); 
        console.log(errors)
        console.log("body", req.body)
        if(errors.isEmpty()) {
            const products = loadProducts();
            const {category,name,brands,description,price,discount} =req.body;
            const productsModify = products.map(product => {
                if (product.id === +req.params.id) {
                    return {
                        ...product,
                        ...req.body,
                        name: name.trim(),
                        brands: brands.trim(),
                        category: category.trim(),
                        price: +price,
                        discount: +discount,
                        image : "intelcorei3-mini.jpg",
                        description: description.trim()
                    }
         }
         return product
        })

        storeProducts(productsModify)
        return res.redirect('/products/detail/' + req.params.id)
        
    } else {
        return res.render('productEdit',{
            category : loadCategory().sort(),
            product : loadProducts().find(product => product.id === +req.params.id),
            brands: loadBrands().sort(),
            errors : errors.mapped(),

        })
    }
  },
   */

  /* carrito: (req,res)=>{
        return res.render('shopping-cart',{
            
        })
    },

    filter: (req,res) => {
        const productsFilter = products.filter(product => product.section === req.query.section)
    return res.render('products', {
        products : productsFilter,
        
    })
    }, */
  /* 	search: (req, res) => {
		// Do the magic
		let { keywords } = req.query;

		db.Product.findAll({
			where: {
				[Op.or]: [
					{
						name: {
							[Op.substring]: keywords,
						},
					},
					{
						description: {
							[Op.substring]: keywords,
						},
					},
				],
			},
			include: ["images"],
		})
			.then((result) => {
				return res.render("search", {
					result,
					toThousand,
					keywords,
				});
			})
			.catch((error) => console.log(error));
	},
    */
};
