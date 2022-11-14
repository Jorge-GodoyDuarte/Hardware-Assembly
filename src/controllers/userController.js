const db = require("../database/models");
const sequelize = db.sequelize;
const { loadUsers, storeUsers } = require("../data/db_Module");
const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const authConfig = require("../database/config/auth");
/*     CRUD DATABASE     */
module.exports = {
  login: (req, res) => {
    return res.render("login");
  },

  register: (req, res) => {
    return res.render("register", {
      title: "Register",
    });
  },


  processLogin: async (req, res) => {
    const errors = validationResult(req);

    /*  res.send(errors) */
    if(errors.isEmpty()){

    let { email } = req.body;

    db.User.findOne({
      where: {
        email,
      },
      include: [
        {
          association: "roles",
        },
      ],
    })
      .then(({id, firstname, lastname, role_id}) => {
        
        req.session.userLogin = {
          id,
          firstname,
          lastname,
          role_id
        }

        /* guardar la cookie */

        return res.redirect("/");
      })
      .catch(error => console.log(error))
    }else {
      return res.render("login", {
        errors : errors.mapped()
      });
    }

  },
  processRegister: async (req, res) => {
    const errors = validationResult(req);
       const { firstname, lastname, email, city, street, phone, password} = req.body;

       // VALIDACIONES
      if (errors.isEmpty()) {
        // CREACIÓN DEL USUARIO
      db.User.create({
          firstname: firstname && firstname.trim(),
          lastname: lastname && lastname.trim(),
          email: email && email.trim(),
          password : bcryptjs.hashSync(password, 10),
          role_id: 1,
          payment_id: 3,
          city: city && city.trim(),
          street: street && street.trim(),
          phone: +phone,
        }).then((user) => {
            return res.redirect('/users/login')
        })

      } else{
        return res.render('register',{
            errors: errors.mapped(),
            old: req.body
        })
    }

  },


  logout: (req, res) => {
    delete req.session.userLogin;
    res.cookie("userHassembly", null, {
      maxAge: -1,
    });
    return res.redirect("/");
  },

  profile: (req, res) => {
    let user = loadUsers().find((user) => user.id === req.session.userLogin.id);
    return res.render("profile", {
      user,
    });
  },
  update: (req, res) => {
    const { firstName, lastName, birthday, address, city, province, about } =
      req.body;
    let user = loadUsers().find((user) => user.id == req.session.userLogin.id);
    let usersModify = loadUsers().map((user) => {
      if (user.id === +req.params.id) {
        return {
          ...user,
          ...req.body,
          password: req.body.password
            ? bcryptjs.hashSync(req.body.password, 10)
            : user.password,
          avatar: req.file ? req.file.filename : req.session.userLogin.avatar,
        };
      }
      return user;
    });
    if (req.file && req.session.userLogin.avatar) {
      if (
        fs.existsSync(
          path.resolve(
            __dirname,
            "..",
            "public",
            "images",
            "users",
            req.session.userLogin.avatar
          )
        )
      ) {
        console.log(">>>>>>>>>>", req.session.userLogin.avatar);
        fs.unlinkSync(
          path.resolve(
            __dirname,
            "..",
            "public",
            "images",
            "users",
            req.session.userLogin.avatar
          )
        );
      }
    }

    req.session.userLogin = {
      ...req.session.userLogin,
      firstName,
      avatar: req.file ? req.file.filename : req.session.userLogin.avatar,
    };

    storeUsers(usersModify);
    return res.redirect("/");
  },
  updateEdit: (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const { firstName, lastName, email, password } = req.body;
      const users = loadUsers();
      const userModify = users.map((user) => {
        if (users.id === req.session.userLogin.id) {
          if (req.file && req.session.userLogin.avatar) {
            if (
              fs.existsSync(
                path.resolve(
                  __dirname,
                  "..",
                  "public",
                  "images",
                  "users",
                  req.session.userLogin.avatar
                )
              )
            ) {
              console.log(">>>>>>>>>>", req.session.userLogin.avatar);
              fs.unlinkSync(
                path.resolve(
                  __dirname,
                  "..",
                  "public",
                  "images",
                  "users",
                  req.session.userLogin.avatar
                )
              );
            }
          }
          return {
            id: user.id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password: bcryptjs.hashSync(password.trim(), 10),
            rol: "user",
            avatar: req.file ? req.file.filename : req.session.userLogin.avatar,
          };
        }

        return user;
      });
      if (req.file && req.session.userLogin.avatar) {
        if (
          fs.existsSync(
            path.resolve(
              __dirname,
              "..",
              "public",
              "images",
              "users",
              req.session.userLogin.avatar
            )
          )
        ) {
          console.log(">>>>>>>>>>", req.session.userLogin.avatar);
          fs.unlinkSync(
            path.resolve(
              __dirname,
              "..",
              "public",
              "images",
              "users",
              req.session.userLogin.avatar
            )
          );
        }
      }

      storeUsers(userModify);
      return res.redirect("/users/profile");
    } else {
      return res.render("profile", {
        errors: errors.mapped(),
        old: req.body,
        user: loadUsers().find((user) => user.id === req.session.userLogin.id),
      });
    }
  },
};
