const {Client} = require('pg')

const client = new Client ({
  host: "ec2-18-213-133-45.compute-1.amazonaws.com",
  user: "levdkwfshldbzd",
  port: 5432,
  password: "b03723fe8a5739e8b9ad19ad3435dde4d8985e1b18e7f373912a2399eaa60b88",
  database: "d82rah36vv08hg",
  ssl: true
})

client.connect();

client.query(`Select * from wallet_info`, (err,res)=>{
  if(!err) {
    console.log(res.rows);
  }else{
    console.log(err.message);
  }
  client.end;
})
