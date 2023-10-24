const {Client}  = require('pg'); 
const conn_string = require('./db_config');

async function select_form() {
    //Query DB to get all shop
    const client = new Client(conn_string);
    await client.connect(); 
    const query_string = `SELECT * FROM departments`;
    let query_results = await client.query(query_string);
    //Generate select_form 
    // console.log(query_results);
    let html_form = `<form action="" method=POST>
        <label for="shops">Choose a shop:</label>
        <select name="shop_selected">
        <option value=0 selected> All </option>`
    for (let i=0; i < query_results.rowCount; i++){
        let row = query_results.rows[i];
        html_form += `<option value=${row.id}>${row.name}</option>`
    }
    html_form += `</select><input type="submit" value="Submit"></form>`;
    client.end();
    return html_form
}

module.exports = select_form;