const { con } = require("./connection")

exports.select=(sql,output)=>{
    con.query(sql,(err,result)=>{
        output(err,result)
    })
}

exports.dml=(sql,output)=>{
    con.query(sql,(err)=>{
        output(err)
    })
}