const _ = require("lodash");
const dblite = require("dblite");
const fs = require("fs");

const SQLite = (dir) => {
  try {
    if (fs.existsSync(dir)) {
      var conn = dblite(dir);
      return {
        connect: (name, columms) => {
          let keys = _.keysIn(columms);
          var vals = [];
          let model = [];
          var models = {};
          for (let i = 0; i < keys.length; i++) {
            vals.push(`${keys[i]} ${columms[keys[i]]["type"]}`);
            model.push({ [keys[i]]: columms[keys[i]]["model"] });
          }
          for (let i = 0; i < model.length; i++) {
            models[keys[i]] = model[i][keys[i]];
          }
          conn.query(`CREATE TABLE IF NOT EXISTS ${name}(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,${vals.join(",")})`);
          return {
            get: (call) => {
              conn.query(`SELECT * FROM ${name}`, models, call);
            },
            getById: (id, call) => {
              conn.query(
                `SELECT * FROM ${name} WHERE id = ${id}`,
                models,
                call
              );
            },
            getOne: (where, call) => {
              let key = _.keysIn(where);
              conn.query(
                `SELECT * FROM ${name} WHERE ${key[0]} = ${where[key[0]]}`,
                models,
                call
              );
            },
            create: (columms) => {
              let key = _.keysIn(columms);
              let keys = [];
              let into = [];
              for (let i = 0; i < key.length; i++) {
                keys.push(`"${columms[key[i]]}"`);
                into.push(`${key[i]}`);
              }
              conn.query(
                `INSERT INTO ${name}(${into.join(",")}) VALUES(${keys.join(
                  ","
                )})`
              );
            },
            update: (columms, where) => {
              let key = _.keysIn(columms);
              let keyW = _.keysIn(where);
              let chaves = [];
              let updateValor = [];
              for (let i = 0; i < key.length; i++) {
                chaves.push(`${key[i]}`);
                updateValor.push(`${columms[key[i]]}`);
              }
              conn.query("BEGIN TRANSACTION");
              for (let i = 0; i < chaves.length; i++) {
                conn.query(
                  `UPDATE ${name} SET ${chaves[i]} = "${
                    updateValor[i]
                  }" where ${keyW[0]} = ${where[keyW[0]]}`
                );
              }
              conn.query("COMMIT");
            },
            delete: (where) => {
              let w = _.keysIn(where);
              conn.query(`DELETE FROM ${name} WHERE ${w[0]} = ${where[w[0]]}`);
            },
            deleteById: (id) => {
                conn.query(`DELETE FROM ${name} WHERE id = ${id}`)
            },
          };
        },
      };
    } else {
      throw new Error("the file does no exits");
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = SQLite;