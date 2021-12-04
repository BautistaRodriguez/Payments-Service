const {Client} = require('pg')
let client;

client = new Client ({
  host: "ec2-18-213-133-45.compute-1.amazonaws.com",
  user: "levdkwfshldbzd",
  port: 5432,
  password: "b03723fe8a5739e8b9ad19ad3435dde4d8985e1b18e7f373912a2399eaa60b88",
  database: "d82rah36vv08hg",
  ssl: true
})

client.connect();

exports.client = client;


/*
//INSERT INTO WALLET_INFO(user_id, wallet_address, wallet_private_key) VALUES (554,'02323ABF23FBA1','02323ABF23FBA2');
client.query(`Insert into WALLET_INFO(user_id, wallet_address, wallet_private_key) VALUES (4,'ABC1','ABC2');`, (err,res)=>{
  if(!err) {
    console.log(res.rows);
  }else{
    console.log(err.message);
  }
  client.end;
})
*/
